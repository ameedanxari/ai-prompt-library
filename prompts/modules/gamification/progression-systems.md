# Progression Systems Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

This template provides comprehensive patterns for implementing user progression systems including level systems, experience points, skill trees, and advancement mechanics that create long-term engagement and provide clear paths for user growth. It covers experience calculation, level progression, skill unlocking, and mastery tracking to create meaningful advancement experiences.

## Context

Progression systems are fundamental to user retention and engagement, providing clear goals, sense of achievement, and continuous motivation for users to advance through structured pathways. A well-designed progression system balances challenge with reward, creates meaningful choices, and provides multiple paths for different user preferences. This template addresses the complexity of building scalable progression systems that support various advancement mechanics, skill specializations, and long-term player development.

## Instructions

1. **Setup Progression Infrastructure**: Configure level systems, experience tracking, and skill trees
2. **Implement Experience Calculation**: Build comprehensive XP earning and level calculation systems
3. **Add Skill Tree Management**: Enable skill unlocking, prerequisites, and specialization paths
4. **Configure Mastery Systems**: Implement expertise tracking and mastery progression
5. **Enable Progression Rewards**: Add level-up rewards and milestone achievements
6. **Add Visual Progression**: Build progress bars, skill trees, and advancement displays
7. **Test Progression Balance**: Validate XP curves, level requirements, and skill costs

## Examples

### Example 1: Progression System Service
```typescript
interface ProgressionSystemService {
  gainExperience(userId: string, xpGain: ExperienceGain): Promise<ProgressionUpdate>;
  unlockSkill(userId: string, skillId: string): Promise<SkillUnlock>;
  getUserProgression(userId: string): Promise<UserProgression>;
  getSkillTree(userId: string, treeId: string): Promise<UserSkillTree>;
  calculateLevelRequirements(level: number): Promise<LevelRequirements>;
}

const progressionSystem = new ProgressionSystemService();
const update = await progressionSystem.gainExperience('user-123', {
  amount: 150,
  source: 'complete_quest',
  category: 'combat',
  metadata: { questId: 'dragon-slayer', difficulty: 'hard' }
});
```

### Example 2: Skill Tree Configuration
```typescript
interface SkillTreeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'combat' | 'crafting' | 'social' | 'exploration';
  skills: SkillDefinition[];
  maxLevel: number;
  prerequisites?: SkillTreePrerequisite[];
}

const combatSkillTree: SkillTreeDefinition = {
  id: 'combat-mastery',
  name: 'Combat Mastery',
  description: 'Master the art of combat and warfare',
  category: 'combat',
  maxLevel: 50,
  skills: [
    {
      id: 'basic-attack',
      name: 'Basic Attack',
      description: 'Improve basic attack damage',
      maxRank: 10,
      cost: (rank) => rank * 100,
      prerequisites: [],
      effects: [
        { type: 'damage_bonus', value: (rank) => rank * 5 }
      ]
    },
    {
      id: 'critical-strike',
      name: 'Critical Strike',
      description: 'Increase critical hit chance',
      maxRank: 5,
      cost: (rank) => rank * 200,
      prerequisites: [{ skillId: 'basic-attack', minRank: 3 }],
      effects: [
        { type: 'crit_chance', value: (rank) => rank * 2 }
      ]
    }
  ]
};
```

### Example 3: Experience Calculation Engine
```typescript
interface ExperienceCalculator {
  calculateXpGain(action: UserAction, context: ActionContext): Promise<number>;
  calculateLevelFromXp(totalXp: number): Promise<number>;
  calculateXpToNextLevel(currentLevel: number, currentXp: number): Promise<number>;
  applyXpMultipliers(baseXp: number, multipliers: XpMultiplier[]): Promise<number>;
}

const xpCalculator = new ExperienceCalculator();
const xpGain = await xpCalculator.calculateXpGain(
  { type: 'defeat_enemy', enemyLevel: 15, playerLevel: 12 },
  { difficulty: 'hard', groupSize: 1, perfectExecution: true }
);
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableProgression | Enable progression system | boolean | No | true |
| enableSkillTrees | Enable skill tree system | boolean | No | true |
| enableMasterySystem | Enable mastery tracking | boolean | No | true |
| maxPlayerLevel | Maximum player level | number | No | 100 |
| xpCurveType | Experience curve type | string | No | 'exponential' |
| enablePrestige | Enable prestige/rebirth system | boolean | No | false |
| skillPointsPerLevel | Skill points gained per level | number | No | 1 |
| enableMultipleSkillTrees | Enable multiple skill specializations | boolean | No | true |

## Expected Output

This template will produce:
- **Level Progression System**: Comprehensive experience and level management
- **Skill Tree Framework**: Multi-path skill development and specialization
- **Mastery Tracking System**: Expertise progression and mastery levels
- **Experience Calculation Engine**: Dynamic XP calculation with multipliers
- **Progression Rewards System**: Level-up rewards and milestone bonuses
- **Visual Progression Displays**: Progress bars, skill trees, and advancement UI
- **Prestige System**: Advanced progression for veteran players
- **Analytics Dashboard**: Progression metrics and player advancement tracking

## Implementation Patterns

### Progression System Architecture

```typescript
// Core Progression System Architecture
interface ProgressionSystemCore {
  levelManager: LevelManager;
  experienceCalculator: ExperienceCalculator;
  skillTreeManager: SkillTreeManager;
  masteryTracker: MasteryTracker;
  progressionRewards: ProgressionRewardSystem;
  prestigeSystem: PrestigeSystem;
}

interface UserProgression {
  userId: string;
  
  // Level progression
  level: number;
  totalExperience: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  
  // Skill progression
  availableSkillPoints: number;
  spentSkillPoints: number;
  unlockedSkills: UnlockedSkill[];
  
  // Mastery progression
  masteryLevels: MasteryLevel[];
  totalMasteryPoints: number;
  
  // Prestige progression
  prestigeLevel: number;
  prestigePoints: number;
  
  // Statistics
  totalActionsCompleted: number;
  progressionStartDate: Date;
  lastProgressionUpdate: Date;
  
  // Milestones
  achievedMilestones: ProgressionMilestone[];
  nextMilestone?: ProgressionMilestone;
}

interface ExperienceGain {
  amount: number;
  source: string;
  category: ExperienceCategory;
  
  // Context for calculations
  difficulty?: DifficultyLevel;
  groupBonus?: number;
  streakMultiplier?: number;
  
  // Metadata
  metadata: Record<string, any>;
  timestamp: Date;
  
  // Validation
  isValidated: boolean;
  validationSource?: string;
}

interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  
  // Progression
  maxRank: number;
  costFunction: (rank: number) => number;
  
  // Requirements
  prerequisites: SkillPrerequisite[];
  levelRequirement?: number;
  
  // Effects
  effects: SkillEffect[];
  
  // Tree positioning
  treeId: string;
  position: { x: number; y: number };
  
  // Metadata
  category: SkillCategory;
  rarity: SkillRarity;
  tags: string[];
}

interface UnlockedSkill {
  skillId: string;
  currentRank: number;
  maxRank: number;
  totalPointsSpent: number;
  
  // Progression tracking
  unlockedAt: Date;
  lastUpgradeAt: Date;
  
  // Usage statistics
  timesUsed: number;
  effectivenessRating: number;
  
  // Current effects
  activeEffects: ActiveSkillEffect[];
}
```

**Level Manager Implementation**
```typescript
class LevelManager {
  private progressionStore: ProgressionStore;
  private xpCalculator: ExperienceCalculator;
  private rewardProcessor: ProgressionRewardProcessor;
  private milestoneTracker: MilestoneTracker;

  async gainExperience(userId: string, xpGain: ExperienceGain): Promise<ProgressionUpdate> {
    // Get current progression
    const progression = await this.getUserProgression(userId);
    
    // Calculate actual XP gain with multipliers
    const actualXpGain = await this.calculateActualXpGain(userId, xpGain);
    
    // Update experience
    const newTotalXp = progression.totalExperience + actualXpGain;
    const previousLevel = progression.level;
    const newLevel = await this.xpCalculator.calculateLevelFromXp(newTotalXp);
    
    // Calculate level progression
    const leveledUp = newLevel > previousLevel;
    const levelsGained = newLevel - previousLevel;
    
    // Update progression data
    const updatedProgression: UserProgression = {
      ...progression,
      totalExperience: newTotalXp,
      level: newLevel,
      currentLevelXp: await this.calculateCurrentLevelXp(newLevel, newTotalXp),
      xpToNextLevel: await this.calculateXpToNextLevel(newLevel, newTotalXp),
      lastProgressionUpdate: new Date()
    };

    // Add skill points for level ups
    if (leveledUp) {
      const skillPointsGained = levelsGained * this.config.skillPointsPerLevel;
      updatedProgression.availableSkillPoints += skillPointsGained;
    }

    // Save progression
    await this.progressionStore.save(updatedProgression);

    // Process level-up rewards
    const rewards: ProgressionReward[] = [];
    if (leveledUp) {
      for (let level = previousLevel + 1; level <= newLevel; level++) {
        const levelRewards = await this.rewardProcessor.processLevelUpRewards(userId, level);
        rewards.push(...levelRewards);
      }
    }

    // Check for milestones
    const newMilestones = await this.milestoneTracker.checkMilestones(userId, updatedProgression);

    // Create progression update
    const progressionUpdate: ProgressionUpdate = {
      userId,
      previousLevel,
      newLevel,
      levelsGained,
      xpGained: actualXpGain,
      totalXp: newTotalXp,
      skillPointsGained: leveledUp ? levelsGained * this.config.skillPointsPerLevel : 0,
      rewards,
      newMilestones,
      timestamp: new Date()
    };

    // Emit progression events
    if (leveledUp) {
      await this.eventEmitter.emit('user.level_up', {
        userId,
        newLevel,
        levelsGained,
        rewards
      });
    }

    await this.eventEmitter.emit('user.xp_gained', {
      userId,
      xpGained: actualXpGain,
      source: xpGain.source,
      category: xpGain.category
    });

    return progressionUpdate;
  }

  private async calculateActualXpGain(userId: string, xpGain: ExperienceGain): Promise<number> {
    let actualXp = xpGain.amount;

    // Apply group bonus
    if (xpGain.groupBonus) {
      actualXp *= (1 + xpGain.groupBonus);
    }

    // Apply streak multiplier
    if (xpGain.streakMultiplier) {
      actualXp *= xpGain.streakMultiplier;
    }

    // Apply user-specific multipliers
    const userMultipliers = await this.getUserXpMultipliers(userId);
    for (const multiplier of userMultipliers) {
      if (this.multiplierApplies(multiplier, xpGain)) {
        actualXp *= multiplier.value;
      }
    }

    // Apply difficulty scaling
    if (xpGain.difficulty) {
      const difficultyMultiplier = this.getDifficultyMultiplier(xpGain.difficulty);
      actualXp *= difficultyMultiplier;
    }

    return Math.round(actualXp);
  }

  private async calculateCurrentLevelXp(level: number, totalXp: number): Promise<number> {
    const levelStartXp = await this.xpCalculator.getXpRequiredForLevel(level);
    return totalXp - levelStartXp;
  }

  private async calculateXpToNextLevel(level: number, totalXp: number): Promise<number> {
    if (level >= this.config.maxPlayerLevel) {
      return 0; // Max level reached
    }

    const nextLevelXp = await this.xpCalculator.getXpRequiredForLevel(level + 1);
    return nextLevelXp - totalXp;
  }

  async getUserProgression(userId: string): Promise<UserProgression> {
    let progression = await this.progressionStore.findByUserId(userId);
    
    if (!progression) {
      // Initialize new progression
      progression = await this.initializeProgression(userId);
    }

    return progression;
  }

  private async initializeProgression(userId: string): Promise<UserProgression> {
    const initialProgression: UserProgression = {
      userId,
      level: 1,
      totalExperience: 0,
      currentLevelXp: 0,
      xpToNextLevel: await this.xpCalculator.getXpRequiredForLevel(2),
      availableSkillPoints: this.config.initialSkillPoints || 0,
      spentSkillPoints: 0,
      unlockedSkills: [],
      masteryLevels: [],
      totalMasteryPoints: 0,
      prestigeLevel: 0,
      prestigePoints: 0,
      totalActionsCompleted: 0,
      progressionStartDate: new Date(),
      lastProgressionUpdate: new Date(),
      achievedMilestones: [],
      nextMilestone: await this.milestoneTracker.getNextMilestone(1, 0)
    };

    await this.progressionStore.save(initialProgression);
    return initialProgression;
  }
}
```

### Experience Calculator Implementation

```typescript
class ExperienceCalculator {
  private curveConfig: XpCurveConfig;

  async calculateLevelFromXp(totalXp: number): Promise<number> {
    // Binary search for efficiency with large level ranges
    let low = 1;
    let high = this.config.maxPlayerLevel;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const xpRequired = await this.getXpRequiredForLevel(mid);
      const nextLevelXp = await this.getXpRequiredForLevel(mid + 1);
      
      if (totalXp >= xpRequired && totalXp < nextLevelXp) {
        return mid;
      } else if (totalXp < xpRequired) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    
    return this.config.maxPlayerLevel;
  }

  async getXpRequiredForLevel(level: number): Promise<number> {
    if (level <= 1) return 0;
    
    switch (this.curveConfig.type) {
      case 'linear':
        return this.calculateLinearXp(level);
      case 'exponential':
        return this.calculateExponentialXp(level);
      case 'logarithmic':
        return this.calculateLogarithmicXp(level);
      case 'custom':
        return this.calculateCustomXp(level);
      default:
        return this.calculateExponentialXp(level);
    }
  }

  private calculateExponentialXp(level: number): number {
    const baseXp = this.curveConfig.baseXp || 100;
    const exponent = this.curveConfig.exponent || 1.5;
    const multiplier = this.curveConfig.multiplier || 1;
    
    return Math.floor(baseXp * Math.pow(level - 1, exponent) * multiplier);
  }

  private calculateLinearXp(level: number): number {
    const baseXp = this.curveConfig.baseXp || 100;
    const increment = this.curveConfig.increment || 50;
    
    return baseXp + (level - 2) * increment;
  }

  private calculateLogarithmicXp(level: number): number {
    const baseXp = this.curveConfig.baseXp || 100;
    const logBase = this.curveConfig.logBase || 2;
    const multiplier = this.curveConfig.multiplier || 100;
    
    return Math.floor(baseXp + multiplier * Math.log(level) / Math.log(logBase));
  }

  async calculateXpGain(action: UserAction, context: ActionContext): Promise<number> {
    // Get base XP for action type
    const baseXp = await this.getBaseXpForAction(action.type);
    
    // Apply context modifiers
    let modifiedXp = baseXp;
    
    // Difficulty scaling
    if (context.difficulty) {
      modifiedXp *= this.getDifficultyMultiplier(context.difficulty);
    }
    
    // Level difference scaling (for combat/challenges)
    if (context.targetLevel && context.playerLevel) {
      const levelDifference = context.targetLevel - context.playerLevel;
      modifiedXp *= this.getLevelDifferenceMultiplier(levelDifference);
    }
    
    // Performance bonus
    if (context.performanceScore) {
      modifiedXp *= this.getPerformanceMultiplier(context.performanceScore);
    }
    
    // First-time bonus
    if (context.isFirstTime) {
      modifiedXp *= this.config.firstTimeBonusMultiplier || 1.5;
    }
    
    // Diminishing returns for repeated actions
    if (context.recentCompletions) {
      modifiedXp *= this.getDiminishingReturnsMultiplier(context.recentCompletions);
    }

    return Math.max(1, Math.floor(modifiedXp));
  }

  private getDifficultyMultiplier(difficulty: DifficultyLevel): number {
    const multipliers = {
      'trivial': 0.1,
      'easy': 0.5,
      'normal': 1.0,
      'hard': 1.5,
      'expert': 2.0,
      'legendary': 3.0
    };
    
    return multipliers[difficulty] || 1.0;
  }

  private getLevelDifferenceMultiplier(levelDifference: number): number {
    // Bonus for fighting higher level enemies, penalty for lower level
    if (levelDifference > 0) {
      return 1 + (levelDifference * 0.1); // 10% bonus per level above
    } else if (levelDifference < 0) {
      const penalty = Math.abs(levelDifference) * 0.1;
      return Math.max(0.1, 1 - penalty); // 10% penalty per level below, minimum 10%
    }
    
    return 1.0;
  }

  private getPerformanceMultiplier(performanceScore: number): number {
    // Performance score from 0-100, multiplier from 0.5-2.0
    return 0.5 + (performanceScore / 100) * 1.5;
  }

  private getDiminishingReturnsMultiplier(recentCompletions: number): number {
    // Reduce XP for repeated actions to prevent grinding
    if (recentCompletions <= 0) return 1.0;
    
    const diminishingFactor = this.config.diminishingReturnsFactor || 0.9;
    return Math.pow(diminishingFactor, recentCompletions);
  }
}
```

### Skill Tree Manager Implementation

```typescript
class SkillTreeManager {
  private skillTreeStore: SkillTreeStore;
  private userSkillStore: UserSkillStore;
  private skillValidator: SkillValidator;
  private effectProcessor: SkillEffectProcessor;

  async unlockSkill(userId: string, skillId: string): Promise<SkillUnlock> {
    // Get skill definition
    const skillDef = await this.skillTreeStore.findSkillById(skillId);
    if (!skillDef) {
      throw new Error('Skill not found');
    }

    // Get user progression
    const progression = await this.progressionStore.findByUserId(userId);
    if (!progression) {
      throw new Error('User progression not found');
    }

    // Check if skill is already unlocked
    const existingSkill = progression.unlockedSkills.find(s => s.skillId === skillId);
    if (existingSkill) {
      throw new Error('Skill already unlocked');
    }

    // Validate prerequisites
    const prerequisiteCheck = await this.skillValidator.checkPrerequisites(
      userId, 
      skillDef.prerequisites, 
      progression.unlockedSkills
    );
    
    if (!prerequisiteCheck.valid) {
      throw new Error(`Prerequisites not met: ${prerequisiteCheck.missingRequirements.join(', ')}`);
    }

    // Check skill point cost
    const skillCost = skillDef.costFunction(1);
    if (progression.availableSkillPoints < skillCost) {
      throw new Error('Insufficient skill points');
    }

    // Check level requirement
    if (skillDef.levelRequirement && progression.level < skillDef.levelRequirement) {
      throw new Error(`Level ${skillDef.levelRequirement} required`);
    }

    // Create unlocked skill
    const unlockedSkill: UnlockedSkill = {
      skillId,
      currentRank: 1,
      maxRank: skillDef.maxRank,
      totalPointsSpent: skillCost,
      unlockedAt: new Date(),
      lastUpgradeAt: new Date(),
      timesUsed: 0,
      effectivenessRating: 0,
      activeEffects: await this.effectProcessor.calculateSkillEffects(skillDef, 1)
    };

    // Update user progression
    const updatedProgression: UserProgression = {
      ...progression,
      availableSkillPoints: progression.availableSkillPoints - skillCost,
      spentSkillPoints: progression.spentSkillPoints + skillCost,
      unlockedSkills: [...progression.unlockedSkills, unlockedSkill],
      lastProgressionUpdate: new Date()
    };

    await this.progressionStore.save(updatedProgression);

    // Apply skill effects
    await this.effectProcessor.applySkillEffects(userId, unlockedSkill.activeEffects);

    // Create unlock result
    const skillUnlock: SkillUnlock = {
      userId,
      skillId,
      skillName: skillDef.name,
      rank: 1,
      cost: skillCost,
      effects: unlockedSkill.activeEffects,
      unlockedAt: new Date()
    };

    // Emit skill unlock event
    await this.eventEmitter.emit('skill.unlocked', skillUnlock);

    return skillUnlock;
  }

  async upgradeSkill(userId: string, skillId: string): Promise<SkillUpgrade> {
    const progression = await this.progressionStore.findByUserId(userId);
    if (!progression) {
      throw new Error('User progression not found');
    }

    const unlockedSkill = progression.unlockedSkills.find(s => s.skillId === skillId);
    if (!unlockedSkill) {
      throw new Error('Skill not unlocked');
    }

    if (unlockedSkill.currentRank >= unlockedSkill.maxRank) {
      throw new Error('Skill already at maximum rank');
    }

    const skillDef = await this.skillTreeStore.findSkillById(skillId);
    if (!skillDef) {
      throw new Error('Skill definition not found');
    }

    // Calculate upgrade cost
    const nextRank = unlockedSkill.currentRank + 1;
    const upgradeCost = skillDef.costFunction(nextRank);

    if (progression.availableSkillPoints < upgradeCost) {
      throw new Error('Insufficient skill points');
    }

    // Update skill
    const previousRank = unlockedSkill.currentRank;
    unlockedSkill.currentRank = nextRank;
    unlockedSkill.totalPointsSpent += upgradeCost;
    unlockedSkill.lastUpgradeAt = new Date();
    unlockedSkill.activeEffects = await this.effectProcessor.calculateSkillEffects(skillDef, nextRank);

    // Update progression
    const updatedProgression: UserProgression = {
      ...progression,
      availableSkillPoints: progression.availableSkillPoints - upgradeCost,
      spentSkillPoints: progression.spentSkillPoints + upgradeCost,
      lastProgressionUpdate: new Date()
    };

    await this.progressionStore.save(updatedProgression);

    // Apply new skill effects
    await this.effectProcessor.applySkillEffects(userId, unlockedSkill.activeEffects);

    return {
      userId,
      skillId,
      previousRank,
      newRank: nextRank,
      cost: upgradeCost,
      newEffects: unlockedSkill.activeEffects,
      upgradedAt: new Date()
    };
  }

  async getUserSkillTree(userId: string, treeId: string): Promise<UserSkillTree> {
    const skillTree = await this.skillTreeStore.findById(treeId);
    if (!skillTree) {
      throw new Error('Skill tree not found');
    }

    const progression = await this.progressionStore.findByUserId(userId);
    if (!progression) {
      throw new Error('User progression not found');
    }

    // Build user skill tree with unlock status
    const userSkills: UserSkillTreeNode[] = [];
    
    for (const skillDef of skillTree.skills) {
      const unlockedSkill = progression.unlockedSkills.find(s => s.skillId === skillDef.id);
      
      const node: UserSkillTreeNode = {
        skill: skillDef,
        isUnlocked: !!unlockedSkill,
        currentRank: unlockedSkill?.currentRank || 0,
        canUnlock: await this.canUnlockSkill(userId, skillDef.id, progression),
        canUpgrade: await this.canUpgradeSkill(userId, skillDef.id, progression),
        nextUpgradeCost: unlockedSkill 
          ? skillDef.costFunction(unlockedSkill.currentRank + 1)
          : skillDef.costFunction(1),
        activeEffects: unlockedSkill?.activeEffects || []
      };

      userSkills.push(node);
    }

    return {
      treeId,
      treeName: skillTree.name,
      category: skillTree.category,
      userLevel: progression.level,
      availableSkillPoints: progression.availableSkillPoints,
      skills: userSkills,
      totalPointsSpent: progression.spentSkillPoints,
      completionPercentage: this.calculateTreeCompletion(userSkills)
    };
  }

  private async canUnlockSkill(
    userId: string, 
    skillId: string, 
    progression: UserProgression
  ): Promise<boolean> {
    const skillDef = await this.skillTreeStore.findSkillById(skillId);
    if (!skillDef) return false;

    // Check if already unlocked
    if (progression.unlockedSkills.find(s => s.skillId === skillId)) {
      return false;
    }

    // Check level requirement
    if (skillDef.levelRequirement && progression.level < skillDef.levelRequirement) {
      return false;
    }

    // Check skill points
    const cost = skillDef.costFunction(1);
    if (progression.availableSkillPoints < cost) {
      return false;
    }

    // Check prerequisites
    const prerequisiteCheck = await this.skillValidator.checkPrerequisites(
      userId, 
      skillDef.prerequisites, 
      progression.unlockedSkills
    );

    return prerequisiteCheck.valid;
  }

  private calculateTreeCompletion(skills: UserSkillTreeNode[]): number {
    const totalSkills = skills.length;
    const unlockedSkills = skills.filter(s => s.isUnlocked).length;
    
    return totalSkills > 0 ? (unlockedSkills / totalSkills) * 100 : 0;
  }
}
```

### Mastery System Implementation

```typescript
class MasteryTracker {
  private masteryStore: MasteryStore;
  private progressionStore: ProgressionStore;
  private masteryCalculator: MasteryCalculator;

  async trackMasteryProgress(userId: string, action: MasteryAction): Promise<MasteryUpdate> {
    // Get current mastery levels
    const progression = await this.progressionStore.findByUserId(userId);
    if (!progression) {
      throw new Error('User progression not found');
    }

    // Find or create mastery level for this category
    let masteryLevel = progression.masteryLevels.find(m => m.category === action.category);
    
    if (!masteryLevel) {
      masteryLevel = {
        category: action.category,
        level: 1,
        experience: 0,
        totalActions: 0,
        firstActionAt: new Date(),
        lastActionAt: new Date(),
        milestones: []
      };
      progression.masteryLevels.push(masteryLevel);
    }

    // Calculate mastery XP gain
    const masteryXpGain = await this.masteryCalculator.calculateMasteryXp(action, masteryLevel);
    
    // Update mastery progress
    const previousLevel = masteryLevel.level;
    masteryLevel.experience += masteryXpGain;
    masteryLevel.totalActions += 1;
    masteryLevel.lastActionAt = new Date();
    
    // Calculate new mastery level
    const newMasteryLevel = await this.masteryCalculator.calculateMasteryLevel(masteryLevel.experience);
    const masteryLeveledUp = newMasteryLevel > previousLevel;
    
    masteryLevel.level = newMasteryLevel;

    // Check for mastery milestones
    const newMilestones: MasteryMilestone[] = [];
    if (masteryLeveledUp) {
      const milestones = await this.checkMasteryMilestones(masteryLevel);
      newMilestones.push(...milestones);
      masteryLevel.milestones.push(...milestones);
    }

    // Update total mastery points
    progression.totalMasteryPoints = progression.masteryLevels.reduce(
      (total, m) => total + m.level, 
      0
    );

    await this.progressionStore.save(progression);

    // Create mastery update
    const masteryUpdate: MasteryUpdate = {
      userId,
      category: action.category,
      previousLevel,
      newLevel: newMasteryLevel,
      xpGained: masteryXpGain,
      totalXp: masteryLevel.experience,
      masteryLeveledUp,
      newMilestones,
      timestamp: new Date()
    };

    // Emit mastery events
    if (masteryLeveledUp) {
      await this.eventEmitter.emit('mastery.level_up', masteryUpdate);
    }

    return masteryUpdate;
  }

  private async checkMasteryMilestones(masteryLevel: MasteryLevel): Promise<MasteryMilestone[]> {
    const milestones: MasteryMilestone[] = [];
    
    // Check level-based milestones
    const levelMilestones = [5, 10, 25, 50, 100];
    
    for (const milestone of levelMilestones) {
      if (masteryLevel.level >= milestone && 
          !masteryLevel.milestones.find(m => m.type === 'level' && m.value === milestone)) {
        milestones.push({
          type: 'level',
          value: milestone,
          achievedAt: new Date(),
          reward: await this.getMasteryMilestoneReward('level', milestone)
        });
      }
    }

    // Check action-based milestones
    const actionMilestones = [100, 500, 1000, 5000, 10000];
    
    for (const milestone of actionMilestones) {
      if (masteryLevel.totalActions >= milestone && 
          !masteryLevel.milestones.find(m => m.type === 'actions' && m.value === milestone)) {
        milestones.push({
          type: 'actions',
          value: milestone,
          achievedAt: new Date(),
          reward: await this.getMasteryMilestoneReward('actions', milestone)
        });
      }
    }

    return milestones;
  }
}
```

## Integration Points

### Achievement System Integration
```typescript
interface ProgressionAchievementIntegration {
  trackLevelUpAchievements(userId: string, newLevel: number): Promise<void>;
  trackSkillUnlockAchievements(userId: string, skillUnlock: SkillUnlock): Promise<void>;
  trackMasteryAchievements(userId: string, masteryUpdate: MasteryUpdate): Promise<void>;
  trackProgressionMilestones(userId: string, progression: UserProgression): Promise<void>;
}

class ProgressionAchievementTracker {
  async handleLevelUp(event: LevelUpEvent): Promise<void> {
    const { userId, newLevel, levelsGained } = event;
    
    // Check level-based achievements
    const levelAchievements = [
      { level: 10, achievementId: 'first-steps' },
      { level: 25, achievementId: 'getting-stronger' },
      { level: 50, achievementId: 'veteran-adventurer' },
      { level: 100, achievementId: 'legendary-hero' }
    ];

    for (const achievement of levelAchievements) {
      if (newLevel >= achievement.level) {
        await this.achievementSystem.checkAchievement(userId, achievement.achievementId);
      }
    }

    // Check rapid progression achievements
    if (levelsGained >= 5) {
      await this.achievementSystem.checkAchievement(userId, 'rapid-progression');
    }
  }

  async handleSkillUnlock(event: SkillUnlockEvent): Promise<void> {
    const { userId, skillId } = event;
    
    // Get user's total unlocked skills
    const progression = await this.progressionStore.findByUserId(userId);
    const totalSkills = progression?.unlockedSkills.length || 0;

    // Check skill count achievements
    const skillCountAchievements = [
      { count: 5, achievementId: 'skill-collector' },
      { count: 15, achievementId: 'skill-master' },
      { count: 50, achievementId: 'skill-legend' }
    ];

    for (const achievement of skillCountAchievements) {
      if (totalSkills >= achievement.count) {
        await this.achievementSystem.checkAchievement(userId, achievement.achievementId);
      }
    }

    // Check specific skill achievements
    const skillAchievements = await this.getSkillSpecificAchievements(skillId);
    for (const achievementId of skillAchievements) {
      await this.achievementSystem.checkAchievement(userId, achievementId);
    }
  }
}
```

### Notification System Integration
```typescript
interface ProgressionNotificationService {
  notifyLevelUp(userId: string, levelUpData: LevelUpData): Promise<void>;
  notifySkillUnlock(userId: string, skillUnlock: SkillUnlock): Promise<void>;
  notifyMasteryProgress(userId: string, masteryUpdate: MasteryUpdate): Promise<void>;
  notifyProgressionMilestone(userId: string, milestone: ProgressionMilestone): Promise<void>;
}

class ProgressionNotificationHandler {
  async handleLevelUp(event: LevelUpEvent): Promise<void> {
    const { userId, newLevel, rewards } = event;
    
    // Send level up notification
    await this.notificationService.send(userId, {
      type: 'level_up',
      title: 'Level Up!',
      message: `Congratulations! You've reached level ${newLevel}!`,
      data: {
        newLevel,
        rewards: rewards.map(r => ({
          type: r.type,
          amount: r.amount,
          description: r.description
        }))
      },
      priority: 'high'
    });

    // Send milestone notifications for significant levels
    const significantLevels = [10, 25, 50, 75, 100];
    if (significantLevels.includes(newLevel)) {
      await this.notificationService.send(userId, {
        type: 'level_milestone',
        title: 'Major Milestone!',
        message: `You've reached the significant milestone of level ${newLevel}!`,
        data: { level: newLevel },
        priority: 'high'
      });
    }
  }

  async handleSkillUnlock(event: SkillUnlockEvent): Promise<void> {
    const { userId, skillName, effects } = event;
    
    await this.notificationService.send(userId, {
      type: 'skill_unlocked',
      title: 'New Skill Unlocked!',
      message: `You've learned ${skillName}!`,
      data: {
        skillName,
        effects: effects.map(e => e.description)
      }
    });
  }

  async handleMasteryLevelUp(event: MasteryLevelUpEvent): Promise<void> {
    const { userId, category, newLevel } = event;
    
    await this.notificationService.send(userId, {
      type: 'mastery_level_up',
      title: 'Mastery Improved!',
      message: `Your ${category} mastery has reached level ${newLevel}!`,
      data: { category, newLevel }
    });
  }
}
```

## Security Considerations

### Progression Integrity Protection
```typescript
interface ProgressionSecurityService {
  validateXpGain(userId: string, xpGain: ExperienceGain): Promise<ValidationResult>;
  detectProgressionCheating(userId: string): Promise<CheatDetection>;
  auditProgressionChanges(userId: string): Promise<ProgressionAudit>;
  preventSkillExploits(userId: string, skillId: string): Promise<ExploitPrevention>;
}

class ProgressionSecurityValidator {
  async validateXpGain(userId: string, xpGain: ExperienceGain): Promise<ValidationResult> {
    const checks: Promise<SecurityCheck>[] = [
      this.checkXpRealism(xpGain),
      this.checkXpVelocity(userId, xpGain),
      this.checkSourceAuthenticity(xpGain),
      this.checkActionContext(xpGain),
      this.checkUserBehavior(userId, xpGain)
    ];

    const results = await Promise.all(checks);
    const failedChecks = results.filter(r => !r.passed);

    if (failedChecks.length > 0) {
      await this.logSecurityEvent(userId, 'xp_gain_blocked', {
        xpGain,
        failedChecks: failedChecks.map(c => c.reason)
      });

      return {
        valid: false,
        reason: 'Security validation failed',
        details: failedChecks
      };
    }

    return { valid: true };
  }

  private async checkXpRealism(xpGain: ExperienceGain): Promise<SecurityCheck> {
    // Check if XP gain is realistic for the action type
    const maxPossibleXp = await this.getMaxPossibleXp(xpGain.source, xpGain.metadata);
    
    if (xpGain.amount > maxPossibleXp) {
      return {
        passed: false,
        reason: 'XP gain exceeds maximum possible for action',
        severity: 'high'
      };
    }

    return { passed: true };
  }

  private async checkXpVelocity(userId: string, xpGain: ExperienceGain): Promise<SecurityCheck> {
    const recentXpGains = await this.getRecentXpGains(userId, { minutes: 5 });
    const totalRecentXp = recentXpGains.reduce((sum, gain) => sum + gain.amount, 0);
    
    if (totalRecentXp > this.config.maxXpPerMinute) {
      return {
        passed: false,
        reason: 'XP gain velocity too high',
        severity: 'medium'
      };
    }

    return { passed: true };
  }

  async detectProgressionCheating(userId: string): Promise<CheatDetection> {
    const progression = await this.progressionStore.findByUserId(userId);
    if (!progression) {
      return { detected: false };
    }

    const suspiciousPatterns: SuspiciousPattern[] = [];

    // Check for impossible progression speed
    const progressionRate = this.calculateProgressionRate(progression);
    if (progressionRate > this.config.maxReasonableProgressionRate) {
      suspiciousPatterns.push({
        type: 'impossible_progression_speed',
        severity: 'high',
        evidence: { rate: progressionRate }
      });
    }

    // Check for skill unlock patterns
    const skillUnlockPattern = this.analyzeSkillUnlockPattern(progression.unlockedSkills);
    if (skillUnlockPattern.suspicious) {
      suspiciousPatterns.push({
        type: 'suspicious_skill_pattern',
        severity: 'medium',
        evidence: skillUnlockPattern.evidence
      });
    }

    return {
      detected: suspiciousPatterns.length > 0,
      patterns: suspiciousPatterns,
      riskScore: this.calculateRiskScore(suspiciousPatterns)
    };
  }
}
```

## Testing Considerations

### Progression System Testing
```typescript
describe('Progression System', () => {
  it('should calculate XP and levels correctly', async () => {
    const userId = 'test-user-123';
    
    // Gain XP
    const xpGain: ExperienceGain = {
      amount: 500,
      source: 'complete_quest',
      category: 'adventure',
      metadata: { questId: 'test-quest' },
      timestamp: new Date(),
      isValidated: true
    };

    const update = await progressionSystem.gainExperience(userId, xpGain);
    
    expect(update.xpGained).toBe(500);
    expect(update.newLevel).toBeGreaterThan(update.previousLevel);
  });

  it('should handle skill unlocking correctly', async () => {
    const userId = 'test-user-456';
    const skillId = 'basic-attack';
    
    // Give user enough skill points
    await progressionSystem.addSkillPoints(userId, 100);
    
    const skillUnlock = await progressionSystem.unlockSkill(userId, skillId);
    
    expect(skillUnlock.skillId).toBe(skillId);
    expect(skillUnlock.rank).toBe(1);
    
    const progression = await progressionSystem.getUserProgression(userId);
    expect(progression.unlockedSkills).toHaveLength(1);
    expect(progression.unlockedSkills[0].skillId).toBe(skillId);
  });

  it('should enforce skill prerequisites', async () => {
    const userId = 'test-user-789';
    const advancedSkillId = 'critical-strike'; // Requires basic-attack
    
    // Try to unlock advanced skill without prerequisites
    await expect(
      progressionSystem.unlockSkill(userId, advancedSkillId)
    ).rejects.toThrow('Prerequisites not met');
    
    // Unlock prerequisite first
    await progressionSystem.unlockSkill(userId, 'basic-attack');
    
    // Now should be able to unlock advanced skill
    const skillUnlock = await progressionSystem.unlockSkill(userId, advancedSkillId);
    expect(skillUnlock.skillId).toBe(advancedSkillId);
  });

  it('should track mastery progression', async () => {
    const userId = 'test-user-101';
    const masteryAction: MasteryAction = {
      category: 'combat',
      actionType: 'defeat_enemy',
      difficulty: 'normal',
      performance: 85
    };

    const masteryUpdate = await progressionSystem.trackMasteryProgress(userId, masteryAction);
    
    expect(masteryUpdate.category).toBe('combat');
    expect(masteryUpdate.xpGained).toBeGreaterThan(0);
  });
});
```

## Real-World Considerations

### Scalability
- Use efficient data structures for skill trees and progression tracking
- Implement caching for frequently accessed progression data
- Use batch processing for XP calculations and level updates
- Consider database sharding for large user bases

### Performance Optimization
- Cache skill definitions and XP curves
- Use lazy loading for skill tree displays
- Implement efficient algorithms for prerequisite checking
- Optimize progression calculations with memoization

### User Experience
- Design meaningful progression curves that maintain engagement
- Provide clear visual feedback for progression milestones
- Balance skill costs and benefits for meaningful choices
- Create multiple progression paths for different play styles

### Business Considerations
- Monitor progression metrics and player retention
- A/B test different XP curves and skill costs
- Design progression systems that encourage long-term engagement
- Consider monetization opportunities through progression boosters
