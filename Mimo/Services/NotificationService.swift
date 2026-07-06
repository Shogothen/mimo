import Foundation
import UserNotifications

/// Vorbereitete lokale Notification-Struktur.
/// Standardmäßig inaktiv – wird nur genutzt, wenn der Nutzer im Profil zustimmt.
struct NotificationService {

    static func sampleTexts(petName: String) -> [String] {
        [
            "\(petName) sitzt dramatisch im Zimmer und wartet auf dich.",
            "\(petName) hat angeblich eine wichtige Entdeckung gemacht. Es ist wahrscheinlich ein Kissen.",
            "\(petName) möchte kurz deine Aufmerksamkeit. Natürlich rein geschäftlich."
        ]
    }

    /// Fragt sauber nach Permission. Completion liefert das Ergebnis auf dem Main Thread.
    static func requestPermission(completion: @escaping (Bool) -> Void) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            DispatchQueue.main.async { completion(granted) }
        }
    }

    /// Plant eine tägliche Erinnerung (18:00 Uhr) mit zufälligem Text.
    static func scheduleDailyReminder(petName: String) {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: ["mimo.daily"])

        let content = UNMutableNotificationContent()
        content.title = petName
        content.body = sampleTexts(petName: petName).randomElement() ?? "\(petName) wartet auf dich."
        content.sound = .default

        var components = DateComponents()
        components.hour = 18
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(identifier: "mimo.daily", content: content, trigger: trigger)
        center.add(request)
    }

    static func cancelAll() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }
}
