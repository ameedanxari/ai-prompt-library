//
//  CardStackView.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct CardStackView: View {
    let items: [MediaItem]
    let onSwipe: (SwipeAction) -> Void
    
    @State private var currentIndex: Int = 0
    @State private var dragOffset: CGSize = .zero
    @State private var dragState: SwipeState = SwipeState()
    
    var body: some View {
        ZStack {
            if currentIndex < items.count {
                ForEach(0..<min(3, items.count - currentIndex), id: \.self) { index in
                    let cardIndex = currentIndex + index
                    if cardIndex < items.count {
                        CardView(
                            item: items[cardIndex],
                            offset: index == 0 ? dragOffset : .zero,
                            scale: index == 0 ? 1.0 : 1.0 - CGFloat(index) * 0.05,
                            opacity: index == 0 ? 1.0 : 1.0 - CGFloat(index) * 0.2
                        )
                        .zIndex(Double(items.count - cardIndex))
                    }
                }
            } else {
                Text("No more items to review")
                    .font(DesignTokens.typography("body")?.font() ?? .body)
                    .foregroundColor(DesignTokens.color("text", for: .light) ?? .black)
            }
        }
        .gesture(
            DragGesture()
                .onChanged { value in
                    dragOffset = value.translation
                    dragState = SwipeState(
                        direction: value.translation.width > 0 ? .right : .left,
                        translation: value.translation,
                        velocity: .zero,
                        isDragging: true
                    )
                }
                .onEnded { value in
                    handleSwipeEnd(velocity: value.velocity)
                }
        )
    }
    
    private func handleSwipeEnd(velocity: CGSize) {
        let threshold: CGFloat = 100
        
        if abs(dragOffset.width) > threshold || abs(velocity.width) > 500 {
            let actionType: SwipeActionType = dragOffset.width > 0 ? .keep : .delete
            let action = SwipeAction(item: items[currentIndex], action: actionType)
            onSwipe(action)
            
            withAnimation(.spring()) {
                currentIndex += 1
                dragOffset = .zero
            }
        } else {
            withAnimation(.spring()) {
                dragOffset = .zero
            }
        }
        
        dragState = SwipeState(isDragging: false)
    }
}

struct CardView: View {
    let item: MediaItem
    let offset: CGSize
    let scale: CGFloat
    let opacity: Double
    
    var body: some View {
        GlassCard(config: .default) {
            VStack {
                // Media preview placeholder
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 300)
                    .overlay(
                        Text(item.type == .video ? "Video" : "Photo")
                            .font(DesignTokens.typography("caption")?.font() ?? .caption)
                            .foregroundColor(DesignTokens.color("text", for: .light) ?? .black)
                    )
                
                // Item info
                VStack(alignment: .leading, spacing: 8) {
                    Text("\(item.width) x \(item.height)")
                        .font(DesignTokens.typography("caption")?.font() ?? .caption)
                        .foregroundColor(DesignTokens.color("textSecondary", for: .light) ?? .gray)
                    
                    Text(formatFileSize(item.fileSize))
                        .font(DesignTokens.typography("caption")?.font() ?? .caption)
                        .foregroundColor(DesignTokens.color("textSecondary", for: .light) ?? .gray)
                }
            }
        }
        .offset(offset)
        .scaleEffect(scale)
        .opacity(opacity)
        .rotationEffect(.degrees(offset.width / 20))
    }
    
    private func formatFileSize(_ bytes: Int64) -> String {
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useMB, .useGB]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: bytes)
    }
}
