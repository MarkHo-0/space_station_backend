const SETTING_VERSION = '1';

export class Setting {

  /** @type {import('mysql2/promise').Pool} @private */
  db = null

  constructor(connection) {
    this.db = connection
  }

  async toolboxAvailabilities() {
    const [settings, _] = await this.db.execute("SELECT `class_swap_enabled`, `study_parner_enabled` FROM settings WHERE `version` = " + SETTING_VERSION)

    return {
      class_swapping: Boolean(settings[0]['class_swap_enabled']),
      parner_matching: Boolean(settings[0]['study_parner_enabled'])
    }
  }
}