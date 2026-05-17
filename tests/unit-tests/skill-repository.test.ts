import { describe, expect, it } from 'vitest';
import { createSkillDefinition } from '../../src/skill-system/skill-definition';
import {
  createInMemorySkillRepository,
  InMemorySkillStorage,
  InMemoryVersionManager,
  StorageBackedDependencyResolver,
} from '../../src/skill-system/skill-repository';

function skill(id: string, name: string, dependencies = []) {
  return createSkillDefinition({
    id,
    name,
    version: '1.0.0',
    description: `${name} test skill`,
    category: 'utility',
    keywords: name.toLowerCase().split(/\s+/),
    dependencies,
    implementation: {
      type: 'typescript-function',
      runtime: 'nodejs',
      entryPoint: 'execute',
      source: 'function execute(input) { return input; }',
    },
  });
}

describe('SkillRepository', () => {
  it('persists registered skills and rebuilds metadata search on initialize', async () => {
    const repository = await createInMemorySkillRepository();
    await repository.registerSkill(skill('skill-auth', 'Auth Generator'));
    await repository.registerSkill(skill('skill-api', 'API Generator'));

    const matches = await repository.findSkills({ keywords: ['auth'] });

    expect(matches.map(match => match.skill.id)).toEqual(['skill-auth']);
    expect(await repository.getSkill('skill-api')).toMatchObject({ name: 'API Generator' });
  });

  it('resolves dependency order and rejects missing dependencies', async () => {
    const base = skill('skill-base', 'Base');
    const dependent = skill('skill-dependent', 'Dependent', [
      { skillId: 'skill-base', versionConstraint: '^1.0.0', required: true },
    ]);
    const repository = await createInMemorySkillRepository([base, dependent]);

    const resolution = await repository.resolveDependencies(['skill-dependent']);

    expect(resolution.resolved).toBe(true);
    expect(resolution.resolvedSkillIds).toEqual(['skill-base', 'skill-dependent']);

    const storage = new InMemorySkillStorage([
      skill('skill-broken', 'Broken', [
        { skillId: 'skill-missing', versionConstraint: '*', required: true },
      ]),
    ]);
    const versionManager = new InMemoryVersionManager(storage);
    const resolver = new StorageBackedDependencyResolver(storage, versionManager);

    expect((await resolver.resolve(['skill-broken'])).resolved).toBe(false);
  });
});
