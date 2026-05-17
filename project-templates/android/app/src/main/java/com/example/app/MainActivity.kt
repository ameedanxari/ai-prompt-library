package com.example.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.example.app.model.media.MediaItem
import com.example.app.model.media.MediaType
import com.example.app.ui.swipe.CardStackView

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { AppTemplateApp() }
    }
}

@Composable
fun AppTemplateApp() {
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            CardStackView(
                items = previewItems(),
                onSwipe = {}
            )
        }
    }
}

private fun previewItems(): List<MediaItem> = listOf(
    MediaItem(
        id = "preview-photo",
        uri = "",
        type = MediaType.PHOTO,
        creationTimeMillis = 0,
        modifiedTimeMillis = 0,
        fileSizeBytes = 2_400_000,
        width = 3024,
        height = 4032,
        durationMillis = null,
        displayName = "Sample photo",
        bucketName = "Camera",
    )
)
