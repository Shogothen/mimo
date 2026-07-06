import Foundation
import AudioToolbox

/// Dezente System-Sounds ohne eigene Assets.
/// Bewusst sparsam eingesetzt: Fangen im Mini-Game, Level-Up, Erfolg.
enum SoundService {

    enum Effect {
        case catchStar
        case levelUp
        case achievement

        var systemSoundID: SystemSoundID {
            switch self {
            case .catchStar:   return 1104 // kurzer Tick
            case .levelUp:     return 1025 // kleine Fanfare
            case .achievement: return 1027 // heller Akkord
            }
        }
    }

    static func play(_ effect: Effect) {
        AudioServicesPlaySystemSound(effect.systemSoundID)
    }
}
