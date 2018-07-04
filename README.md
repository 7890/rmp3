Control mixxx with RMP-3 in MIDI Mode
=====================================

MIDI mapping and script files for the Reloop RMP-3 cross media player to use as controller in mixxx (tested with Version 1.11.0).
Feel free to adapt to your needs!

* http://www.reloop.com/reloop-rmp-3-alpha-1153
* http://www.mixxx.org
* http://www.mixxx.org/wiki/doku.php/mixxxcontrols
* http://www.mixxx.org/wiki/doku.php/midi_controller_mapping_file_format

The author is not related to Reloop. This is a user contribution to mixxx.

![Bindings](reloop-rmp3-bindings-for-mixxx.png)

Install on Linux
----------------

```
  git clone https://github.com/7890/rmp3

  #/usr/share/mixxx/midi/ is assumed to be the place of controller files
  sudo cp rmp3/controllers/* /usr/share/mixxx/midi/

  #(re-)start mixxx and select new controller preset 'Reloop RMP-3'
```
