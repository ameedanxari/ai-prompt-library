package com.example.app.ui.swipe

import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun ReviewProgressView(reviewed: Int, total: Int, modifier: Modifier = Modifier) {
    val progress = if (total <= 0) 0f else reviewed.toFloat() / total.toFloat()
    LinearProgressIndicator(progress = progress.coerceIn(0f, 1f), modifier = modifier)
}
