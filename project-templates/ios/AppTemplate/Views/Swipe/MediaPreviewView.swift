//
//  MediaPreviewView.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct MediaPreviewView: View {
    let item: MediaItem
    let onDismiss: () -> Void
    
    @State private var zoomScale: CGFloat = 1.0
    @State private var panOffset: CGSize = .zero
    @State private var isPlaying: Bool = false
    
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            
            VStack {
                // Media content
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .overlay(
                        Text(item.type == .video ? "Video Preview" : "Photo Preview")
                            .font(DesignTokens.typography("body")?.font() ?? .body)
                            .foregroundColor(DesignTokens.color("text", for: .dark) ?? .white)
                    )
                    .scaleEffect(zoomScale)
                    .offset(panOffset)
                    .gesture(
                        SimultaneousGesture(
                            MagnificationGesture()
                                .onChanged { value in
                                    zoomScale = value
                                }
                                .onEnded { _ in
                                    withAnimation {
                                        zoomScale = 1.0
                                    }
                                },
                            DragGesture()
                                .onChanged { value in
                                    panOffset = value.translation
                                }
                                .onEnded { _ in
                                    withAnimation {
                                        panOffset = .zero
                                    }
                                }
                        )
                    )
                
                // Video controls (if video)
                if item.type == .video {
                    VStack {
                        Spacer()
                        HStack {
                            Button(action: {
                                isPlaying.toggle()
                            }) {
                                Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                                    .font(.largeTitle)
                                    .foregroundColor(.white)
                            }
                        }
                        .padding()
                    }
                }
            }
            
            // Close button
            VStack {
                HStack {
                    Spacer()
                    Button(action: onDismiss) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.largeTitle)
                            .foregroundColor(.white)
                    }
                    .padding()
                }
                Spacer()
            }
        }
    }
}
