/* exported Sounds */
const { Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

class Sounds {
  constructor() {
    this._clickSound = Gio.File.new_for_path(`${Me.path}/assets/click.wav`);
  }

  _playInterfaceClick() {
    global.display.get_sound_player().play_from_file(this._clickSound, 'Interface Click', null);
  }
}
