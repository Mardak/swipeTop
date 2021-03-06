/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Swipe Top.
 *
 * The Initial Developer of the Original Code is The Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Edward Lee <edilee@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const {utils: Cu} = Components;
const PREF_BRANCH = "browser.gesture.swipe.";
const PREFS = {
  "down": "cmd_scrollBottom",
  "down.meta": "Browser:ToggleTabView",
  "up": "cmd_scrollTop",
  "up.meta": "Browser:ToggleTabView",
};

// Keep an array of functions to call when shutting down
let unloaders = [];

/**
 * Replace the default pref value and clear it when unloading
 */
function replaceDefaultPref(key, val) {
  // Cache the pref branch after first use
  let prefs = arguments.callee.prefs;
  if (prefs == null) {
    Cu.import("resource://gre/modules/Services.jsm");
    prefs = Services.prefs.getDefaultBranch(PREF_BRANCH);
    arguments.callee.prefs = prefs;
  }

  // Figure out what type of pref to set
  let prefType = "Char";
  switch (typeof val) {
    case "boolean":
      prefType = "Bool";
      break;
    case "number":
      prefType = "Int";
      break;
  }

  // Convert to the actual function name, e.g., getCharPref
  let getFunc = "get" + prefType + "Pref";
  let setFunc = "set" + prefType + "Pref";

  // Save the current default value to restore it on unload
  let origVal = "";
  try {
    origVal = prefs[getFunc](key);
  }
  // There might not be a default, so just ignore
  catch(ex) {}
  unloaders.push(function() prefs[setFunc](key, origVal));

  // Change the default to the new value
  prefs[setFunc](key, val);
}

/**
 * Handle the add-on being activated on install/enable
 */
function startup(data, reason) {
  for (let [key, val] in Iterator(PREFS))
    replaceDefaultPref(key, val);
}

/**
 * Handle the add-on being deactivated on uninstall/disable
 */
function shutdown(data, reason) {
  unloaders.forEach(function(unload) unload());
}

function install() {}
function uninstall() {}
