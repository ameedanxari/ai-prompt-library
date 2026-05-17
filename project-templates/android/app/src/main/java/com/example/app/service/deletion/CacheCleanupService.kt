package com.example.app.service.deletion

import android.content.Context

class CacheCleanupService(private val context: Context) {
    fun clearAppOwnedCache(): Long {
        val cacheDir = context.cacheDir
        val before = cacheDir.walkTopDown().filter { it.isFile }.sumOf { it.length() }
        cacheDir.listFiles()?.forEach { it.deleteRecursively() }
        val after = cacheDir.walkTopDown().filter { it.isFile }.sumOf { it.length() }
        return (before - after).coerceAtLeast(0)
    }
}
