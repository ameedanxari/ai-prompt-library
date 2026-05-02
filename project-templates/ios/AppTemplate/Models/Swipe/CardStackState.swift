//
//  CardStackState.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct CardStackState {
    let items: [MediaItem]
    let currentIndex: Int
    let visibleCards: [MediaItem]
    let cardOffset: CGFloat
    
    init(
        items: [MediaItem],
        currentIndex: Int = 0,
        visibleCards: [MediaItem] = [],
        cardOffset: CGFloat = 0
    ) {
        self.items = items
        self.currentIndex = currentIndex
        self.visibleCards = visibleCards.isEmpty ? Array(items.prefix(3)) : visibleCards
        self.cardOffset = cardOffset
    }
}

struct CardTransform {
    let scale: CGFloat
    let rotation: CGFloat
    let translation: CGPoint
    let opacity: Double
    
    init(
        scale: CGFloat = 1.0,
        rotation: CGFloat = 0.0,
        translation: CGPoint = .zero,
        opacity: Double = 1.0
    ) {
        self.scale = scale
        self.rotation = rotation
        self.translation = translation
        self.opacity = opacity
    }
}

struct CardAnimation {
    let fromTransform: CardTransform
    let toTransform: CardTransform
    let duration: TimeInterval
    let timingFunction: String
    
    init(
        fromTransform: CardTransform,
        toTransform: CardTransform,
        duration: TimeInterval,
        timingFunction: String = "ease-in-out"
    ) {
        self.fromTransform = fromTransform
        self.toTransform = toTransform
        self.duration = duration
        self.timingFunction = timingFunction
    }
}
