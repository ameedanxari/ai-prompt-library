//
//  PreviewState.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import CoreGraphics

struct PreviewState {
    let isVisible: Bool
    let currentItem: MediaItem?
    let zoomScale: CGFloat
    let panOffset: CGPoint
    let isPlaying: Bool
    
    init(
        isVisible: Bool = false,
        currentItem: MediaItem? = nil,
        zoomScale: CGFloat = 1.0,
        panOffset: CGPoint = .zero,
        isPlaying: Bool = false
    ) {
        self.isVisible = isVisible
        self.currentItem = currentItem
        self.zoomScale = zoomScale
        self.panOffset = panOffset
        self.isPlaying = isPlaying
    }
}

struct VideoPlaybackState {
    let isPlaying: Bool
    let currentTime: TimeInterval
    let duration: TimeInterval
    let playbackRate: Float
    
    init(
        isPlaying: Bool = false,
        currentTime: TimeInterval = 0,
        duration: TimeInterval = 0,
        playbackRate: Float = 1.0
    ) {
        self.isPlaying = isPlaying
        self.currentTime = currentTime
        self.duration = duration
        self.playbackRate = playbackRate
    }
}
