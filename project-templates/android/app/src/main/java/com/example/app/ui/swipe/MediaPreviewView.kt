package com.example.app.ui.swipe

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.example.app.model.media.MediaItem
import com.example.app.model.media.MediaType

@Composable
fun MediaPreviewView(item: MediaItem, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(0.8f)
            .background(Color(0xFFE5E7EB)),
        contentAlignment = Alignment.Center,
    ) {
        Text(if (item.type == MediaType.VIDEO) "Video" else "Photo")
    }
}
