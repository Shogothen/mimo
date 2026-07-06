import Foundation

/// Speichert und lädt den kompletten AppState als JSON-Datei im Documents-Verzeichnis.
struct PersistenceService {

    private static let fileName = "mimo_state.json"

    private static var fileURL: URL {
        FileManager.default
            .urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent(fileName)
    }

    static func load() -> AppState {
        guard let data = try? Data(contentsOf: fileURL),
              let state = try? JSONDecoder().decode(AppState.self, from: data)
        else {
            return AppState()
        }
        return state
    }

    static func save(_ state: AppState) {
        guard let data = try? JSONEncoder().encode(state) else { return }
        try? data.write(to: fileURL, options: .atomic)
    }

    static func reset() {
        try? FileManager.default.removeItem(at: fileURL)
    }
}
