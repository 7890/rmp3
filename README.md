Control mixxx with RMP-3 MIDI Controller
========================================

MIDI mapping and script files for the Reloop RMP-3 cross media player to use as controller in mixxx (tested with Version 1.11.0).
Feel free to adapt to your needs!

* http://www.reloop.com/reloop-rmp-3-alpha-1
* http://www.mixxx.org
* http://www.mixxx.org/wiki/doku.php/mixxxcontrols
* http://www.mixxx.org/wiki/doku.php/midi_controller_mapping_file_format

The author is not related to Reloop. This is a user contribution to mixxx.

Install on Linux
----------------

```
  git clone git://github.com/7890/rmp3.git
  cd rmp3/controllers
  #/usr/share/mixxx/controllers/ is assumed to be the place of controller files
  sudo ln -s `pwd`/Reloop-RMP-3-scripts.js /usr/share/mixxx/controllers/
  sudo ln -s `pwd`/RMP-3.midi.xml /usr/share/mixxx/controllers/
  #(re-)start mixxx and select new controller
```
