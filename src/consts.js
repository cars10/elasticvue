/**
 * Common constants that are used project-wide
 */

/**
 * Different states to distinguish current connection status, also displayed in navbar.
 * - UNKNOWN: initial state
 * - SUCCESS: set after successful connection
 * - ERROR:   set if any error happens
 * @type {{UNKNOWN: string, SUCCESS: string, ERROR: string}}
 */
export const CONNECTION_STATES = {
  UNKNOWN: 'unknown',
  SUCCESS: 'success',
  ERROR: 'error'
}

/**
 * Some defaults used for initial setup.
 */
export const DEFAULT_HOST = 'http://localhost:9200'
export const LOCALSTORAGE_KEY = 'elasticvuex'

/**
 * Supported elasticsearch versions.
 */
export const ELASTICSEARCH_API_VERSIONS = [
  '6.x',
  '6.0',
  '5.6',
  '5.5',
  '5.4',
  '5.3',
  '5.2',
  '5.1',
  '5.0',
  '2.4',
  '1.7',
  '0.90'
]

/**
 * Default search parameters for search and search pages.
 * @type {{q: string, from: number, size: number, index: Array}}
 */
export const DEFAULT_SEARCH_PARAMS = {
  q: '*',
  from: 0,
  size: 1000,
  index: []
}

/**
 * Defaults used in each request
 * @type {{requestTimeout: number, format: string}}
 */
export const REQUEST_DEFAULT_BODY = {
  requestTimeout: 3000,
  format: 'json'
}

export const REQUEST_DEFAULT_HEADERS = {
  'Accept': 'application/json'
}

export const WORDS = ['a-wing', 'a_new_hope', 'a_wing', 'abrams', 'ackbar', 'adirmal_ackbar', 'alderaan', 'amidala', 'anakin', 'anakin_skywalker', 'antilles', 'astromech', 'astromech_droid', 'at-at', 'at-st', 'at_at', 'at_st', 'atat', 'atst', 'attack_of_the_clones', 'aunt_beru', 'aurra_sing', 'awaken', 'awakens', 'awing', 'b-wing', 'b_wing', 'bail_antilles', 'bantha', 'battle_of_jakku', 'bb-8', 'bb8', 'bb_eight', 'beru', 'binks', 'blaster', 'bobba', 'bobba_fett', 'bossk', 'bwing', 'c3po', 'calrissian', 'cantina', 'cantina_band', 'captain_phasma', 'chewbacca', 'chewie', 'chlorians', 'clone_wars', 'cloud_city', 'coruscant', 'count_dooku', 'dagobah', 'dameron', 'dantoine', 'darth', 'darth_plagueis', 'darth_sidious', 'darth_tyrannous', 'darth_vader', 'death_star', 'death_star_ii', 'dooku', 'droid', 'empire_strikes_back', 'episode_vii', 'executor', 'exwing', 'fett', 'finn', 'first_order', 'fisto', 'force', 'force_lightning', 'galactic', 'galactic_empire', 'galaxy', 'general_hux', 'george', 'george_lucas', 'grand_moff', 'grand_moff_tarkin', 'guavian_death_gang', 'han', 'han_solo', 'hoth', 'hux', 'ig-88', 'ig88', 'ig_88', 'jabba', 'jabba_the_hutt', 'jakku', 'jar_jar', 'jar_jar_binks', 'jedi', 'jinn', 'kanjiklub_gang', 'kathleen_kennedy', 'kenobi', 'kit_fisto', 'knights_of_ken', 'kylo', 'kylo_ren', 'lando', 'lando_calrissian', 'leia', 'light-saber', 'lightsaber', 'lor_san_tekka', 'lucas', 'luke', 'luke_skywalker', 'mace', 'mace_windu', 'mandalorian', 'maz_kanata', 'midi-chlorians', 'midichlorians', 'millennium_falcon', 'mon-mothma', 'mon_calamari', 'mon_mothma', 'monmothma', 'mustafar', 'naboo', 'new_jedi_order', 'nien_nunb', 'obi-wan', 'obi-wan_kenobi', 'obi_wan_kenobi', 'obiwan', 'padme_amidala', 'palpatine', 'phasma', 'plagueis', 'plo_koon', 'poe_dameron', 'qui-gon', 'qui-gon_jinn', 'r2', 'r2-d2', 'r2d2', 'rancor', 'rathtars', 'ren', 'return_of_the_jedi', 'revenge_of_the_sith', 'review', 'reviews', 'rey', 'sand-trooper', 'sand_trooper', 'sarlak', 'sidious', 'sith', 'skywalker', 'slave_1', 'slave_one', 'snook', 'snow-speeder', 'snow_speeder', 'solo', 'star', 'star-killer', 'star_destroyer', 'star_killer', 'star_wars', 'starkiller', 'starkiller_base', 'starwars', 'stormtrooper', 'supreme_leader_snoke', 'supreme_leader_snook', 'sw', 'takodana', 'tarkin', 'tatooine', 'the_clone_wars', 'the_force', 'the_force_awakens', 'the_jedi_temple', 'the_phantom_menace', 'ti-fighter', 'ti_fighter', 'tie_fighter', 'tifighter', 'tyrannous', 'unkar_plutt', 'wampa', 'wars', 'windu', 'x-wing', 'xwing', 'y-wing', 'y_wing', 'yoda', 'ywing']
