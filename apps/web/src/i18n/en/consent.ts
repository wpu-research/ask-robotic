// consent ad alanı (English): Veri kaydı onayı.
import type { consent as Tr } from '../tr/consent'

export const consent: typeof Tr = {
  notice: {
    title: 'Learning data (draft, pilot)',
    body: 'We can record which lessons you look at, what you get right in mini tests and how much time you spend on screen, and use this to build a skill map on the My progress page. Your name, email or IP address are not recorded; only an anonymous ID generated randomly on this device is used. You can delete the record at any time, both from this device and from the server, with "Delete my data".',
    minor: 'If you are under 16, recording requires the consent of a parent or legal guardian. Read this together with an adult before giving consent.',
    draft: 'This text is a draft prepared for the pilot; it does not replace a legal privacy notice under Turkish data protection law (KVKK).',
    ack: 'I am over 16, or my parent/guardian has approved this recording.',
  },
  bannerLabel: 'Data recording consent',
  local: 'Keep on this device only',
  sync: 'Keep, and also send anonymously to the server',
  deny: 'Don\'t record',
  mode: {
    local: 'Events are stored in this browser only.',
    sync: 'Events are stored in this browser and sent anonymously to the server.',
    denied: 'Nothing is being recorded.',
  },
  undecided: 'You haven\'t made a choice yet; nothing is being recorded.',
  eventCount: 'Recorded events:',
  settingsTitle: 'My data (draft, pilot)',
  change: 'Change your choice',
  deleteTitle: 'Delete my data',
  deleteButton: 'Delete my data',
  deleteDialog: 'Confirm deletion',
  deleteConfirm: 'The event log, device ID and consent will be permanently deleted from this device and from the server. Are you sure?',
  deleteYes: 'Yes, delete',
  deleteNo: 'Cancel',
  deleteError: 'The records on the server could not be deleted; nothing was deleted. Check your connection and try again.',
  deletedLocal: 'Deleted: the event log, device ID and consent in this browser. Your lesson progress and project files were not affected.',
  deletedServer: 'Deleted: the event log, device ID and consent in this browser, and your records on the server. Your lesson progress and project files were not affected.',
}
