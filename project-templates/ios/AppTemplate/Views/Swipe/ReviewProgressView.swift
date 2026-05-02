//
//  ReviewProgressView.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct ReviewProgressView: View {
    let progress: ReviewProgress
    let config: ProgressIndicatorConfig
    
    var body: some View {
        VStack(spacing: 8) {
            if config.showBar {
                ProgressView(value: progress.progress)
                    .tint(DesignTokens.color("primary", for: .light) ?? .blue)
            }
            
            if config.showCount {
                HStack {
                    Text("\(progress.currentIndex + 1) of \(progress.totalItems)")
                        .font(DesignTokens.typography("caption")?.font() ?? .caption)
                        .foregroundColor(DesignTokens.color("textSecondary", for: .light) ?? .gray)
                    
                    Spacer()
                    
                    Text("\(progress.remainingCount) remaining")
                        .font(DesignTokens.typography("caption")?.font() ?? .caption)
                        .foregroundColor(DesignTokens.color("textSecondary", for: .light) ?? .gray)
                }
            }
            
            if config.showStats {
                HStack(spacing: 16) {
                    Label("\(progress.keptCount)", systemImage: "checkmark.circle")
                        .font(DesignTokens.typography("caption")?.font() ?? .caption)
                        .foregroundColor(.green)
                    
                    Label("\(progress.deletedCount)", systemImage: "trash")
                        .font(DesignTokens.typography("caption")?.font() ?? .caption)
                        .foregroundColor(.red)
                }
            }
        }
        .padding()
    }
}
