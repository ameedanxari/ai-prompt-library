//
//  TokenValidation.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

class TokenValidation {
    static func validateAllTokens() -> [String] {
        var errors: [String] = []
        
        // Validate color tokens
        for (name, token) in DesignTokens.colors {
            if !isValidHex(token.lightValue) {
                errors.append("Color token '\(name)' has invalid lightValue: \(token.lightValue)")
            }
            if !isValidHex(token.darkValue) {
                errors.append("Color token '\(name)' has invalid darkValue: \(token.darkValue)")
            }
        }
        
        // Validate glass effect tokens
        for (name, token) in DesignTokens.glass {
            if token.transparency < 0 || token.transparency > 1 {
                errors.append("Glass token '\(name)' has invalid transparency: \(token.transparency)")
            }
            if token.borderOpacity < 0 || token.borderOpacity > 1 {
                errors.append("Glass token '\(name)' has invalid borderOpacity: \(token.borderOpacity)")
            }
        }
        
        return errors
    }
    
    private static func isValidHex(_ hex: String) -> Bool {
        return hex.range(of: "^#[0-9A-Fa-f]{6}$", options: .regularExpression) != nil
    }
}
