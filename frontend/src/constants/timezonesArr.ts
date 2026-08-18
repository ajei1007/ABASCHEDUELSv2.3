export interface TimezoneType {
  id: string;
  label: string;
}

const data: TimezoneType[] = [
  {
      "label": "UTC-12:00 - Etc/GMT+12",
      "id": "Etc/GMT+12"
  },
  {
      "label": "UTC-11:00 - Etc/GMT+11",
      "id": "Etc/GMT+11"
  },
  {
      "label": "UTC-11:00 - Pacific/Midway",
      "id": "Pacific/Midway"
  },
  {
      "label": "UTC-11:00 - Pacific/Niue",
      "id": "Pacific/Niue"
  },
  {
      "label": "UTC-11:00 - Pacific/Pago_Pago",
      "id": "Pacific/Pago_Pago"
  },
  {
      "label": "UTC-10:00 - Etc/GMT+10",
      "id": "Etc/GMT+10"
  },
  {
      "label": "UTC-10:00 - Pacific/Honolulu",
      "id": "Pacific/Honolulu"
  },
  {
      "label": "UTC-10:00 - Pacific/Johnston",
      "id": "Pacific/Johnston"
  },
  {
      "label": "UTC-10:00 - Pacific/Rarotonga",
      "id": "Pacific/Rarotonga"
  },
  {
      "label": "UTC-10:00 - Pacific/Tahiti",
      "id": "Pacific/Tahiti"
  },
  {
      "label": "UTC-09:00 - America/Anchorage",
      "id": "America/Anchorage"
  },
  {
      "label": "UTC-09:00 - America/Juneau",
      "id": "America/Juneau"
  },
  {
      "label": "UTC-09:00 - America/Nome",
      "id": "America/Nome"
  },
  {
      "label": "UTC-09:00 - America/Sitka",
      "id": "America/Sitka"
  },
  {
      "label": "UTC-09:00 - America/Yakutat",
      "id": "America/Yakutat"
  },
  {
      "label": "UTC-08:00 - America/Santa_Isabel",
      "id": "America/Santa_Isabel"
  },
  {
      "label": "UTC-07:00 - America/Los_Angeles | UTC-08:00 - America/Los_Angeles",
      "id": "America/Los_Angeles"
  },
  {
      "label": "UTC-07:00 - America/Tijuana | UTC-08:00 - America/Tijuana",
      "id": "America/Tijuana"
  },
  {
      "label": "UTC-07:00 - America/Vancouver | UTC-08:00 - America/Vancouver",
      "id": "America/Vancouver"
  },
  {
      "label": "UTC-08:00 - PST8PDT",
      "id": "PST8PDT"
  },
  {
      "label": "UTC-07:00 - America/Creston",
      "id": "America/Creston"
  },
  {
      "label": "UTC-07:00 - America/Dawson",
      "id": "America/Dawson"
  },
  {
      "label": "UTC-07:00 - America/Dawson_Creek",
      "id": "America/Dawson_Creek"
  },
  {
      "label": "UTC-07:00 - America/Hermosillo",
      "id": "America/Hermosillo"
  },
  {
      "label": "UTC-07:00 - America/Phoenix",
      "id": "America/Phoenix"
  },
  {
      "label": "UTC-07:00 - America/Whitehorse",
      "id": "America/Whitehorse"
  },
  {
      "label": "UTC-07:00 - Etc/GMT+7",
      "id": "Etc/GMT+7"
  },
  {
      "label": "UTC-07:00 - America/Chihuahua",
      "id": "America/Chihuahua"
  },
  {
      "label": "UTC-07:00 - America/Mazatlan",
      "id": "America/Mazatlan"
  },
  {
      "label": "UTC-07:00 - America/Boise",
      "id": "America/Boise"
  },
  {
      "label": "UTC-07:00 - America/Cambridge_Bay",
      "id": "America/Cambridge_Bay"
  },
  {
      "label": "UTC-07:00 - America/Denver",
      "id": "America/Denver"
  },
  {
      "label": "UTC-07:00 - America/Edmonton",
      "id": "America/Edmonton"
  },
  {
      "label": "UTC-07:00 - America/Inuvik",
      "id": "America/Inuvik"
  },
  {
      "label": "UTC-07:00 - America/Ojinaga",
      "id": "America/Ojinaga"
  },
  {
      "label": "UTC-07:00 - America/Yellowknife",
      "id": "America/Yellowknife"
  },
  {
      "label": "UTC-07:00 - MST7MDT",
      "id": "MST7MDT"
  },
  {
      "label": "UTC-06:00 - America/Belize",
      "id": "America/Belize"
  },
  {
      "label": "UTC-06:00 - America/Costa_Rica",
      "id": "America/Costa_Rica"
  },
  {
      "label": "UTC-06:00 - America/El_Salvador",
      "id": "America/El_Salvador"
  },
  {
      "label": "UTC-06:00 - America/Guatemala",
      "id": "America/Guatemala"
  },
  {
      "label": "UTC-06:00 - America/Managua",
      "id": "America/Managua"
  },
  {
      "label": "UTC-06:00 - America/Tegucigalpa",
      "id": "America/Tegucigalpa"
  },
  {
      "label": "UTC-06:00 - Etc/GMT+6",
      "id": "Etc/GMT+6"
  },
  {
      "label": "UTC-06:00 - Pacific/Galapagos",
      "id": "Pacific/Galapagos"
  },
  {
      "label": "UTC-06:00 - America/Chicago",
      "id": "America/Chicago"
  },
  {
      "label": "UTC-06:00 - America/Indiana/Knox",
      "id": "America/Indiana/Knox"
  },
  {
      "label": "UTC-06:00 - America/Indiana/Tell_City",
      "id": "America/Indiana/Tell_City"
  },
  {
      "label": "UTC-06:00 - America/Matamoros",
      "id": "America/Matamoros"
  },
  {
      "label": "UTC-06:00 - America/Menominee",
      "id": "America/Menominee"
  },
  {
      "label": "UTC-06:00 - America/North_Dakota/Beulah",
      "id": "America/North_Dakota/Beulah"
  },
  {
      "label": "UTC-06:00 - America/North_Dakota/Center",
      "id": "America/North_Dakota/Center"
  },
  {
      "label": "UTC-06:00 - America/North_Dakota/New_Salem",
      "id": "America/North_Dakota/New_Salem"
  },
  {
      "label": "UTC-06:00 - America/Rainy_River",
      "id": "America/Rainy_River"
  },
  {
      "label": "UTC-06:00 - America/Rankin_Inlet",
      "id": "America/Rankin_Inlet"
  },
  {
      "label": "UTC-06:00 - America/Resolute",
      "id": "America/Resolute"
  },
  {
      "label": "UTC-06:00 - America/Winnipeg",
      "id": "America/Winnipeg"
  },
  {
      "label": "UTC-06:00 - CST6CDT",
      "id": "CST6CDT"
  },
  {
      "label": "UTC-06:00 - America/Bahia_Banderas",
      "id": "America/Bahia_Banderas"
  },
  {
      "label": "UTC-06:00 - America/Cancun",
      "id": "America/Cancun"
  },
  {
      "label": "UTC-06:00 - America/Merida",
      "id": "America/Merida"
  },
  {
      "label": "UTC-06:00 - America/Mexico_City",
      "id": "America/Mexico_City"
  },
  {
      "label": "UTC-06:00 - America/Monterrey",
      "id": "America/Monterrey"
  },
  {
      "label": "UTC-06:00 - America/Regina",
      "id": "America/Regina"
  },
  {
      "label": "UTC-06:00 - America/Swift_Current",
      "id": "America/Swift_Current"
  },
  {
      "label": "UTC-05:00 - America/Bogota",
      "id": "America/Bogota"
  },
  {
      "label": "UTC-05:00 - America/Cayman",
      "id": "America/Cayman"
  },
  {
      "label": "UTC-05:00 - America/Coral_Harbour",
      "id": "America/Coral_Harbour"
  },
  {
      "label": "UTC-05:00 - America/Eirunepe",
      "id": "America/Eirunepe"
  },
  {
      "label": "UTC-05:00 - America/Guayaquil",
      "id": "America/Guayaquil"
  },
  {
      "label": "UTC-05:00 - America/Jamaica",
      "id": "America/Jamaica"
  },
  {
      "label": "UTC-05:00 - America/Lima",
      "id": "America/Lima"
  },
  {
      "label": "UTC-05:00 - America/Panama",
      "id": "America/Panama"
  },
  {
      "label": "UTC-05:00 - America/Rio_Branco",
      "id": "America/Rio_Branco"
  },
  {
      "label": "UTC-05:00 - Etc/GMT+5",
      "id": "Etc/GMT+5"
  },
  {
      "label": "UTC-05:00 - America/Detroit | UTC-04:00 - America/Detroit",
      "id": "America/Detroit"
  },
  {
      "label": "UTC-05:00 - America/Havana | UTC-04:00 - America/Havana",
      "id": "America/Havana"
  },
  {
      "label": "UTC-05:00 - America/Indiana/Petersburg | UTC-04:00 - America/Indiana/Petersburg",
      "id": "America/Indiana/Petersburg"
  },
  {
      "label": "UTC-05:00 - America/Indiana/Vincennes | UTC-04:00 - America/Indiana/Vincennes",
      "id": "America/Indiana/Vincennes"
  },
  {
      "label": "UTC-05:00 - America/Indiana/Winamac | UTC-04:00 - America/Indiana/Winamac",
      "id": "America/Indiana/Winamac"
  },
  {
      "label": "UTC-05:00 - America/Iqaluit | UTC-04:00 - America/Iqaluit",
      "id": "America/Iqaluit"
  },
  {
      "label": "UTC-05:00 - America/Kentucky/Monticello | UTC-04:00 - America/Kentucky/Monticello",
      "id": "America/Kentucky/Monticello"
  },
  {
      "label": "UTC-05:00 - America/Louisville | UTC-04:00 - America/Louisville",
      "id": "America/Louisville"
  },
  {
      "label": "UTC-05:00 - America/Montreal | UTC-04:00 - America/Montreal",
      "id": "America/Montreal"
  },
  {
      "label": "UTC-05:00 - America/Nassau | UTC-04:00 - America/Nassau",
      "id": "America/Nassau"
  },
  {
      "label": "UTC-05:00 - America/New_York | UTC-04:00 - America/New_York",
      "id": "America/New_York"
  },
  {
      "label": "UTC-05:00 - America/Nipigon | UTC-04:00 - America/Nipigon",
      "id": "America/Nipigon"
  },
  {
      "label": "UTC-05:00 - America/Pangnirtung | UTC-04:00 - America/Pangnirtung",
      "id": "America/Pangnirtung"
  },
  {
      "label": "UTC-05:00 - America/Port-au-Prince | UTC-04:00 - America/Port-au-Prince",
      "id": "America/Port-au-Prince"
  },
  {
      "label": "UTC-05:00 - America/Thunder_Bay | UTC-04:00 - America/Thunder_Bay",
      "id": "America/Thunder_Bay"
  },
  {
      "label": "UTC-05:00 - America/Toronto | UTC-04:00 - America/Toronto",
      "id": "America/Toronto"
  },
  {
      "label": "UTC-05:00 - America/Indiana/Marengo",
      "id": "America/Indiana/Marengo"
  },
  {
      "label": "UTC-05:00 - America/Indiana/Vevay",
      "id": "America/Indiana/Vevay"
  },
  {
      "label": "UTC-05:00 - America/Indianapolis",
      "id": "America/Indianapolis"
  },
  {
      "label": "UTC-04:30 - America/Caracas",
      "id": "America/Caracas"
  },
  {
      "label": "UTC-04:00 - America/Asuncion",
      "id": "America/Asuncion"
  },
  {
      "label": "UTC-04:00 - America/Glace_Bay",
      "id": "America/Glace_Bay"
  },
  {
      "label": "UTC-04:00 - America/Goose_Bay",
      "id": "America/Goose_Bay"
  },
  {
      "label": "UTC-04:00 - America/Halifax",
      "id": "America/Halifax"
  },
  {
      "label": "UTC-04:00 - America/Moncton",
      "id": "America/Moncton"
  },
  {
      "label": "UTC-04:00 - America/Thule",
      "id": "America/Thule"
  },
  {
      "label": "UTC-04:00 - Atlantic/Bermuda",
      "id": "Atlantic/Bermuda"
  },
  {
      "label": "UTC-04:00 - America/Campo_Grande",
      "id": "America/Campo_Grande"
  },
  {
      "label": "UTC-04:00 - America/Cuiaba",
      "id": "America/Cuiaba"
  },
  {
      "label": "UTC-04:00 - America/Anguilla",
      "id": "America/Anguilla"
  },
  {
      "label": "UTC-04:00 - America/Antigua",
      "id": "America/Antigua"
  },
  {
      "label": "UTC-04:00 - America/Aruba",
      "id": "America/Aruba"
  },
  {
      "label": "UTC-04:00 - America/Barbados",
      "id": "America/Barbados"
  },
  {
      "label": "UTC-04:00 - America/Blanc-Sablon",
      "id": "America/Blanc-Sablon"
  },
  {
      "label": "UTC-04:00 - America/Boa_Vista",
      "id": "America/Boa_Vista"
  },
  {
      "label": "UTC-04:00 - America/Curacao",
      "id": "America/Curacao"
  },
  {
      "label": "UTC-04:00 - America/Dominica",
      "id": "America/Dominica"
  },
  {
      "label": "UTC-04:00 - America/Grand_Turk",
      "id": "America/Grand_Turk"
  },
  {
      "label": "UTC-04:00 - America/Grenada",
      "id": "America/Grenada"
  },
  {
      "label": "UTC-04:00 - America/Guadeloupe",
      "id": "America/Guadeloupe"
  },
  {
      "label": "UTC-04:00 - America/Guyana",
      "id": "America/Guyana"
  },
  {
      "label": "UTC-04:00 - America/Kralendijk",
      "id": "America/Kralendijk"
  },
  {
      "label": "UTC-04:00 - America/La_Paz",
      "id": "America/La_Paz"
  },
  {
      "label": "UTC-04:00 - America/Lower_Princes",
      "id": "America/Lower_Princes"
  },
  {
      "label": "UTC-04:00 - America/Manaus",
      "id": "America/Manaus"
  },
  {
      "label": "UTC-04:00 - America/Marigot",
      "id": "America/Marigot"
  },
  {
      "label": "UTC-04:00 - America/Martinique",
      "id": "America/Martinique"
  },
  {
      "label": "UTC-04:00 - America/Montserrat",
      "id": "America/Montserrat"
  },
  {
      "label": "UTC-04:00 - America/Port_of_Spain",
      "id": "America/Port_of_Spain"
  },
  {
      "label": "UTC-04:00 - America/Porto_Velho",
      "id": "America/Porto_Velho"
  },
  {
      "label": "UTC-04:00 - America/Puerto_Rico",
      "id": "America/Puerto_Rico"
  },
  {
      "label": "UTC-04:00 - America/Santo_Domingo",
      "id": "America/Santo_Domingo"
  },
  {
      "label": "UTC-04:00 - America/St_Barthelemy",
      "id": "America/St_Barthelemy"
  },
  {
      "label": "UTC-04:00 - America/St_Kitts",
      "id": "America/St_Kitts"
  },
  {
      "label": "UTC-04:00 - America/St_Lucia",
      "id": "America/St_Lucia"
  },
  {
      "label": "UTC-04:00 - America/St_Thomas",
      "id": "America/St_Thomas"
  },
  {
      "label": "UTC-04:00 - America/St_Vincent",
      "id": "America/St_Vincent"
  },
  {
      "label": "UTC-04:00 - America/Tortola",
      "id": "America/Tortola"
  },
  {
      "label": "UTC-04:00 - Etc/GMT+4",
      "id": "Etc/GMT+4"
  },
  {
      "label": "UTC-04:00 - America/Santiago",
      "id": "America/Santiago"
  },
  {
      "label": "UTC-04:00 - Antarctica/Palmer",
      "id": "Antarctica/Palmer"
  },
  {
      "label": "UTC-03:30 - America/St_Johns",
      "id": "America/St_Johns"
  },
  {
      "label": "UTC-03:00 - America/Sao_Paulo",
      "id": "America/Sao_Paulo"
  },
  {
      "label": "UTC-03:00 - America/Argentina/La_Rioja",
      "id": "America/Argentina/La_Rioja"
  },
  {
      "label": "UTC-03:00 - America/Argentina/Rio_Gallegos",
      "id": "America/Argentina/Rio_Gallegos"
  },
  {
      "label": "UTC-03:00 - America/Argentina/Salta",
      "id": "America/Argentina/Salta"
  },
  {
      "label": "UTC-03:00 - America/Argentina/San_Juan",
      "id": "America/Argentina/San_Juan"
  },
  {
      "label": "UTC-03:00 - America/Argentina/San_Luis",
      "id": "America/Argentina/San_Luis"
  },
  {
      "label": "UTC-03:00 - America/Argentina/Tucuman",
      "id": "America/Argentina/Tucuman"
  },
  {
      "label": "UTC-03:00 - America/Argentina/Ushuaia",
      "id": "America/Argentina/Ushuaia"
  },
  {
      "label": "UTC-03:00 - America/Buenos_Aires",
      "id": "America/Buenos_Aires"
  },
  {
      "label": "UTC-03:00 - America/Catamarca",
      "id": "America/Catamarca"
  },
  {
      "label": "UTC-03:00 - America/Cordoba",
      "id": "America/Cordoba"
  },
  {
      "label": "UTC-03:00 - America/Jujuy",
      "id": "America/Jujuy"
  },
  {
      "label": "UTC-03:00 - America/Mendoza",
      "id": "America/Mendoza"
  },
  {
      "label": "UTC-03:00 - America/Araguaina",
      "id": "America/Araguaina"
  },
  {
      "label": "UTC-03:00 - America/Belem",
      "id": "America/Belem"
  },
  {
      "label": "UTC-03:00 - America/Cayenne",
      "id": "America/Cayenne"
  },
  {
      "label": "UTC-03:00 - America/Fortaleza",
      "id": "America/Fortaleza"
  },
  {
      "label": "UTC-03:00 - America/Maceio",
      "id": "America/Maceio"
  },
  {
      "label": "UTC-03:00 - America/Paramaribo",
      "id": "America/Paramaribo"
  },
  {
      "label": "UTC-03:00 - America/Recife",
      "id": "America/Recife"
  },
  {
      "label": "UTC-03:00 - America/Santarem",
      "id": "America/Santarem"
  },
  {
      "label": "UTC-03:00 - Antarctica/Rothera",
      "id": "Antarctica/Rothera"
  },
  {
      "label": "UTC-03:00 - Atlantic/Stanley",
      "id": "Atlantic/Stanley"
  },
  {
      "label": "UTC-03:00 - Etc/GMT+3",
      "id": "Etc/GMT+3"
  },
  {
      "label": "UTC-03:00 - America/Godthab",
      "id": "America/Godthab"
  },
  {
      "label": "UTC-03:00 - America/Montevideo",
      "id": "America/Montevideo"
  },
  {
      "label": "UTC-03:00 - America/Bahia",
      "id": "America/Bahia"
  },
  {
      "label": "UTC-02:00 - America/Noronha",
      "id": "America/Noronha"
  },
  {
      "label": "UTC-02:00 - Atlantic/South_Georgia",
      "id": "Atlantic/South_Georgia"
  },
  {
      "label": "UTC-02:00 - Etc/GMT+2",
      "id": "Etc/GMT+2"
  },
  {
      "label": "UTC-01:00 - America/Scoresbysund",
      "id": "America/Scoresbysund"
  },
  {
      "label": "UTC-01:00 - Atlantic/Azores",
      "id": "Atlantic/Azores"
  },
  {
      "label": "UTC-01:00 - Atlantic/Cape_Verde",
      "id": "Atlantic/Cape_Verde"
  },
  {
      "label": "UTC-01:00 - Etc/GMT+1",
      "id": "Etc/GMT+1"
  },
  {
      "label": "UTC - Africa/Casablanca",
      "id": "Africa/Casablanca"
  },
  {
      "label": "UTC - Africa/El_Aaiun",
      "id": "Africa/El_Aaiun"
  },
  {
      "label": "UTC - America/Danmarkshavn",
      "id": "America/Danmarkshavn"
  },
  {
      "label": "UTC - Etc/GMT",
      "id": "Etc/GMT"
  },
  {
      "label": "UTC - Europe/Isle_of_Man | UTC+01:00 - Europe/Isle_of_Man",
      "id": "Europe/Isle_of_Man"
  },
  {
      "label": "UTC - Europe/Guernsey | UTC+01:00 - Europe/Guernsey",
      "id": "Europe/Guernsey"
  },
  {
      "label": "UTC - Europe/Jersey | UTC+01:00 - Europe/Jersey",
      "id": "Europe/Jersey"
  },
  {
      "label": "UTC - Europe/London | UTC+01:00 - Europe/London",
      "id": "Europe/London"
  },
  {
      "label": "UTC - Atlantic/Canary",
      "id": "Atlantic/Canary"
  },
  {
      "label": "UTC - Atlantic/Faeroe",
      "id": "Atlantic/Faeroe"
  },
  {
      "label": "UTC - Atlantic/Madeira",
      "id": "Atlantic/Madeira"
  },
  {
      "label": "UTC - Europe/Dublin",
      "id": "Europe/Dublin"
  },
  {
      "label": "UTC - Europe/Lisbon",
      "id": "Europe/Lisbon"
  },
  {
      "label": "UTC - Africa/Abidjan",
      "id": "Africa/Abidjan"
  },
  {
      "label": "UTC - Africa/Accra",
      "id": "Africa/Accra"
  },
  {
      "label": "UTC - Africa/Bamako",
      "id": "Africa/Bamako"
  },
  {
      "label": "UTC - Africa/Banjul",
      "id": "Africa/Banjul"
  },
  {
      "label": "UTC - Africa/Bissau",
      "id": "Africa/Bissau"
  },
  {
      "label": "UTC - Africa/Conakry",
      "id": "Africa/Conakry"
  },
  {
      "label": "UTC - Africa/Dakar",
      "id": "Africa/Dakar"
  },
  {
      "label": "UTC - Africa/Freetown",
      "id": "Africa/Freetown"
  },
  {
      "label": "UTC - Africa/Lome",
      "id": "Africa/Lome"
  },
  {
      "label": "UTC - Africa/Monrovia",
      "id": "Africa/Monrovia"
  },
  {
      "label": "UTC - Africa/Nouakchott",
      "id": "Africa/Nouakchott"
  },
  {
      "label": "UTC - Africa/Ouagadougou",
      "id": "Africa/Ouagadougou"
  },
  {
      "label": "UTC - Africa/Sao_Tome",
      "id": "Africa/Sao_Tome"
  },
  {
      "label": "UTC - Atlantic/Reykjavik",
      "id": "Atlantic/Reykjavik"
  },
  {
      "label": "UTC - Atlantic/St_Helena",
      "id": "Atlantic/St_Helena"
  },
  {
      "label": "UTC+01:00 - Arctic/Longyearbyen",
      "id": "Arctic/Longyearbyen"
  },
  {
      "label": "UTC+01:00 - Europe/Amsterdam",
      "id": "Europe/Amsterdam"
  },
  {
      "label": "UTC+01:00 - Europe/Andorra",
      "id": "Europe/Andorra"
  },
  {
      "label": "UTC+01:00 - Europe/Berlin",
      "id": "Europe/Berlin"
  },
  {
      "label": "UTC+01:00 - Europe/Busingen",
      "id": "Europe/Busingen"
  },
  {
      "label": "UTC+01:00 - Europe/Gibraltar",
      "id": "Europe/Gibraltar"
  },
  {
      "label": "UTC+01:00 - Europe/Luxembourg",
      "id": "Europe/Luxembourg"
  },
  {
      "label": "UTC+01:00 - Europe/Malta",
      "id": "Europe/Malta"
  },
  {
      "label": "UTC+01:00 - Europe/Monaco",
      "id": "Europe/Monaco"
  },
  {
      "label": "UTC+01:00 - Europe/Oslo",
      "id": "Europe/Oslo"
  },
  {
      "label": "UTC+01:00 - Europe/Rome",
      "id": "Europe/Rome"
  },
  {
      "label": "UTC+01:00 - Europe/San_Marino",
      "id": "Europe/San_Marino"
  },
  {
      "label": "UTC+01:00 - Europe/Stockholm",
      "id": "Europe/Stockholm"
  },
  {
      "label": "UTC+01:00 - Europe/Vaduz",
      "id": "Europe/Vaduz"
  },
  {
      "label": "UTC+01:00 - Europe/Vatican",
      "id": "Europe/Vatican"
  },
  {
      "label": "UTC+01:00 - Europe/Vienna",
      "id": "Europe/Vienna"
  },
  {
      "label": "UTC+01:00 - Europe/Zurich",
      "id": "Europe/Zurich"
  },
  {
      "label": "UTC+01:00 - Europe/Belgrade",
      "id": "Europe/Belgrade"
  },
  {
      "label": "UTC+01:00 - Europe/Bratislava",
      "id": "Europe/Bratislava"
  },
  {
      "label": "UTC+01:00 - Europe/Budapest",
      "id": "Europe/Budapest"
  },
  {
      "label": "UTC+01:00 - Europe/Ljubljana",
      "id": "Europe/Ljubljana"
  },
  {
      "label": "UTC+01:00 - Europe/Podgorica",
      "id": "Europe/Podgorica"
  },
  {
      "label": "UTC+01:00 - Europe/Prague",
      "id": "Europe/Prague"
  },
  {
      "label": "UTC+01:00 - Europe/Tirane",
      "id": "Europe/Tirane"
  },
  {
      "label": "UTC+01:00 - Africa/Ceuta",
      "id": "Africa/Ceuta"
  },
  {
      "label": "UTC+01:00 - Europe/Brussels",
      "id": "Europe/Brussels"
  },
  {
      "label": "UTC+01:00 - Europe/Copenhagen",
      "id": "Europe/Copenhagen"
  },
  {
      "label": "UTC+01:00 - Europe/Madrid",
      "id": "Europe/Madrid"
  },
  {
      "label": "UTC+01:00 - Europe/Paris",
      "id": "Europe/Paris"
  },
  {
      "label": "UTC+01:00 - Europe/Sarajevo",
      "id": "Europe/Sarajevo"
  },
  {
      "label": "UTC+01:00 - Europe/Skopje",
      "id": "Europe/Skopje"
  },
  {
      "label": "UTC+01:00 - Europe/Warsaw",
      "id": "Europe/Warsaw"
  },
  {
      "label": "UTC+01:00 - Europe/Zagreb",
      "id": "Europe/Zagreb"
  },
  {
      "label": "UTC+01:00 - Africa/Algiers",
      "id": "Africa/Algiers"
  },
  {
      "label": "UTC+01:00 - Africa/Bangui",
      "id": "Africa/Bangui"
  },
  {
      "label": "UTC+01:00 - Africa/Brazzaville",
      "id": "Africa/Brazzaville"
  },
  {
      "label": "UTC+01:00 - Africa/Douala",
      "id": "Africa/Douala"
  },
  {
      "label": "UTC+01:00 - Africa/Kinshasa",
      "id": "Africa/Kinshasa"
  },
  {
      "label": "UTC+01:00 - Africa/Lagos",
      "id": "Africa/Lagos"
  },
  {
      "label": "UTC+01:00 - Africa/Libreville",
      "id": "Africa/Libreville"
  },
  {
      "label": "UTC+01:00 - Africa/Luanda",
      "id": "Africa/Luanda"
  },
  {
      "label": "UTC+01:00 - Africa/Malabo",
      "id": "Africa/Malabo"
  },
  {
      "label": "UTC+01:00 - Africa/Ndjamena",
      "id": "Africa/Ndjamena"
  },
  {
      "label": "UTC+01:00 - Africa/Niamey",
      "id": "Africa/Niamey"
  },
  {
      "label": "UTC+01:00 - Africa/Porto-Novo",
      "id": "Africa/Porto-Novo"
  },
  {
      "label": "UTC+01:00 - Africa/Tunis",
      "id": "Africa/Tunis"
  },
  {
      "label": "UTC+01:00 - Etc/GMT-1",
      "id": "Etc/GMT-1"
  },
  {
      "label": "UTC+01:00 - Africa/Windhoek",
      "id": "Africa/Windhoek"
  },
  {
      "label": "UTC+02:00 - Asia/Nicosia",
      "id": "Asia/Nicosia"
  },
  {
      "label": "UTC+02:00 - Europe/Athens",
      "id": "Europe/Athens"
  },
  {
      "label": "UTC+02:00 - Europe/Bucharest",
      "id": "Europe/Bucharest"
  },
  {
      "label": "UTC+02:00 - Europe/Chisinau",
      "id": "Europe/Chisinau"
  },
  {
      "label": "UTC+02:00 - Asia/Beirut",
      "id": "Asia/Beirut"
  },
  {
      "label": "UTC+02:00 - Africa/Cairo",
      "id": "Africa/Cairo"
  },
  {
      "label": "UTC+02:00 - Asia/Damascus",
      "id": "Asia/Damascus"
  },
  {
      "label": "UTC+02:00 - Europe/Helsinki",
      "id": "Europe/Helsinki"
  },
  {
      "label": "UTC+02:00 - Europe/Kiev",
      "id": "Europe/Kiev"
  },
  {
      "label": "UTC+02:00 - Europe/Mariehamn",
      "id": "Europe/Mariehamn"
  },
  {
      "label": "UTC+02:00 - Europe/Nicosia",
      "id": "Europe/Nicosia"
  },
  {
      "label": "UTC+02:00 - Europe/Riga",
      "id": "Europe/Riga"
  },
  {
      "label": "UTC+02:00 - Europe/Sofia",
      "id": "Europe/Sofia"
  },
  {
      "label": "UTC+02:00 - Europe/Tallinn",
      "id": "Europe/Tallinn"
  },
  {
      "label": "UTC+02:00 - Europe/Uzhgorod",
      "id": "Europe/Uzhgorod"
  },
  {
      "label": "UTC+02:00 - Europe/Vilnius",
      "id": "Europe/Vilnius"
  },
  {
      "label": "UTC+02:00 - Europe/Zaporozhye",
      "id": "Europe/Zaporozhye"
  },
  {
      "label": "UTC+02:00 - Africa/Blantyre",
      "id": "Africa/Blantyre"
  },
  {
      "label": "UTC+02:00 - Africa/Bujumbura",
      "id": "Africa/Bujumbura"
  },
  {
      "label": "UTC+02:00 - Africa/Gaborone",
      "id": "Africa/Gaborone"
  },
  {
      "label": "UTC+02:00 - Africa/Harare",
      "id": "Africa/Harare"
  },
  {
      "label": "UTC+02:00 - Africa/Johannesburg",
      "id": "Africa/Johannesburg"
  },
  {
      "label": "UTC+02:00 - Africa/Kigali",
      "id": "Africa/Kigali"
  },
  {
      "label": "UTC+02:00 - Africa/Lubumbashi",
      "id": "Africa/Lubumbashi"
  },
  {
      "label": "UTC+02:00 - Africa/Lusaka",
      "id": "Africa/Lusaka"
  },
  {
      "label": "UTC+02:00 - Africa/Maputo",
      "id": "Africa/Maputo"
  },
  {
      "label": "UTC+02:00 - Africa/Maseru",
      "id": "Africa/Maseru"
  },
  {
      "label": "UTC+02:00 - Africa/Mbabane",
      "id": "Africa/Mbabane"
  },
  {
      "label": "UTC+02:00 - Etc/GMT-2",
      "id": "Etc/GMT-2"
  },
  {
      "label": "UTC+03:00 - Europe/Istanbul",
      "id": "Europe/Istanbul"
  },
  {
      "label": "UTC+02:00 - Asia/Jerusalem",
      "id": "Asia/Jerusalem"
  },
  {
      "label": "UTC+02:00 - Africa/Tripoli",
      "id": "Africa/Tripoli"
  },
  {
      "label": "UTC+03:00 - Asia/Amman",
      "id": "Asia/Amman"
  },
  {
      "label": "UTC+03:00 - Asia/Baghdad",
      "id": "Asia/Baghdad"
  },
  {
      "label": "UTC+02:00 - Europe/Kaliningrad",
      "id": "Europe/Kaliningrad"
  },
  {
      "label": "UTC+03:00 - Asia/Aden",
      "id": "Asia/Aden"
  },
  {
      "label": "UTC+03:00 - Asia/Bahrain",
      "id": "Asia/Bahrain"
  },
  {
      "label": "UTC+03:00 - Asia/Kuwait",
      "id": "Asia/Kuwait"
  },
  {
      "label": "UTC+03:00 - Asia/Qatar",
      "id": "Asia/Qatar"
  },
  {
      "label": "UTC+03:00 - Asia/Riyadh",
      "id": "Asia/Riyadh"
  },
  {
      "label": "UTC+03:00 - Africa/Addis_Ababa",
      "id": "Africa/Addis_Ababa"
  },
  {
      "label": "UTC+03:00 - Africa/Asmera",
      "id": "Africa/Asmera"
  },
  {
      "label": "UTC+03:00 - Africa/Dar_es_Salaam",
      "id": "Africa/Dar_es_Salaam"
  },
  {
      "label": "UTC+03:00 - Africa/Djibouti",
      "id": "Africa/Djibouti"
  },
  {
      "label": "UTC+03:00 - Africa/Juba",
      "id": "Africa/Juba"
  },
  {
      "label": "UTC+03:00 - Africa/Kampala",
      "id": "Africa/Kampala"
  },
  {
      "label": "UTC+03:00 - Africa/Khartoum",
      "id": "Africa/Khartoum"
  },
  {
      "label": "UTC+03:00 - Africa/Mogadishu",
      "id": "Africa/Mogadishu"
  },
  {
      "label": "UTC+03:00 - Africa/Nairobi",
      "id": "Africa/Nairobi"
  },
  {
      "label": "UTC+03:00 - Antarctica/Syowa",
      "id": "Antarctica/Syowa"
  },
  {
      "label": "UTC+03:00 - Etc/GMT-3",
      "id": "Etc/GMT-3"
  },
  {
      "label": "UTC+03:00 - Indian/Antananarivo",
      "id": "Indian/Antananarivo"
  },
  {
      "label": "UTC+03:00 - Indian/Comoro",
      "id": "Indian/Comoro"
  },
  {
      "label": "UTC+03:00 - Indian/Mayotte",
      "id": "Indian/Mayotte"
  },
  {
      "label": "UTC+03:00 - Europe/Kirov",
      "id": "Europe/Kirov"
  },
  {
      "label": "UTC+03:00 - Europe/Moscow",
      "id": "Europe/Moscow"
  },
  {
      "label": "UTC+03:00 - Europe/Simferopol",
      "id": "Europe/Simferopol"
  },
  {
      "label": "UTC+03:00 - Europe/Volgograd",
      "id": "Europe/Volgograd"
  },
  {
      "label": "UTC+03:00 - Europe/Minsk",
      "id": "Europe/Minsk"
  },
  {
      "label": "UTC+04:00 - Europe/Astrakhan",
      "id": "Europe/Astrakhan"
  },
  {
      "label": "UTC+04:00 - Europe/Samara",
      "id": "Europe/Samara"
  },
  {
      "label": "UTC+04:00 - Europe/Ulyanovsk",
      "id": "Europe/Ulyanovsk"
  },
  {
      "label": "UTC+03:30 - Asia/Tehran",
      "id": "Asia/Tehran"
  },
  {
      "label": "UTC+04:00 - Asia/Dubai",
      "id": "Asia/Dubai"
  },
  {
      "label": "UTC+04:00 - Asia/Muscat",
      "id": "Asia/Muscat"
  },
  {
      "label": "UTC+04:00 - Etc/GMT-4",
      "id": "Etc/GMT-4"
  },
  {
      "label": "UTC+04:00 - Asia/Baku",
      "id": "Asia/Baku"
  },
  {
      "label": "UTC+04:00 - Indian/Mahe",
      "id": "Indian/Mahe"
  },
  {
      "label": "UTC+04:00 - Indian/Mauritius",
      "id": "Indian/Mauritius"
  },
  {
      "label": "UTC+04:00 - Indian/Reunion",
      "id": "Indian/Reunion"
  },
  {
      "label": "UTC+04:00 - Asia/Tbilisi",
      "id": "Asia/Tbilisi"
  },
  {
      "label": "UTC+04:00 - Asia/Yerevan",
      "id": "Asia/Yerevan"
  },
  {
      "label": "UTC+04:30 - Asia/Kabul",
      "id": "Asia/Kabul"
  },
  {
      "label": "UTC+05:00 - Antarctica/Mawson",
      "id": "Antarctica/Mawson"
  },
  {
      "label": "UTC+05:00 - Asia/Aqtau",
      "id": "Asia/Aqtau"
  },
  {
      "label": "UTC+05:00 - Asia/Aqtobe",
      "id": "Asia/Aqtobe"
  },
  {
      "label": "UTC+05:00 - Asia/Ashgabat",
      "id": "Asia/Ashgabat"
  },
  {
      "label": "UTC+05:00 - Asia/Dushanbe",
      "id": "Asia/Dushanbe"
  },
  {
      "label": "UTC+05:00 - Asia/Oral",
      "id": "Asia/Oral"
  },
  {
      "label": "UTC+05:00 - Asia/Samarkand",
      "id": "Asia/Samarkand"
  },
  {
      "label": "UTC+05:00 - Asia/Tashkent",
      "id": "Asia/Tashkent"
  },
  {
      "label": "UTC+05:00 - Etc/GMT-5",
      "id": "Etc/GMT-5"
  },
  {
      "label": "UTC+05:00 - Indian/Kerguelen",
      "id": "Indian/Kerguelen"
  },
  {
      "label": "UTC+05:00 - Indian/Maldives",
      "id": "Indian/Maldives"
  },
  {
      "label": "UTC+05:00 - Asia/Yekaterinburg",
      "id": "Asia/Yekaterinburg"
  },
  {
      "label": "UTC+05:00 - Asia/Karachi",
      "id": "Asia/Karachi"
  },
  {
      "label": "UTC+05:30 - Asia/Kolkata",
      "id": "Asia/Kolkata"
  },
  {
      "label": "UTC+05:30 - Asia/Calcutta",
      "id": "Asia/Calcutta"
  },
  {
      "label": "UTC+05:30 - Asia/Colombo",
      "id": "Asia/Colombo"
  },
  {
      "label": "UTC+05:45 - Asia/Kathmandu",
      "id": "Asia/Kathmandu"
  },
  {
      "label": "UTC+06:00 - Antarctica/Vostok",
      "id": "Antarctica/Vostok"
  },
  {
      "label": "UTC+06:00 - Asia/Almaty",
      "id": "Asia/Almaty"
  },
  {
      "label": "UTC+06:00 - Asia/Bishkek",
      "id": "Asia/Bishkek"
  },
  {
      "label": "UTC+06:00 - Asia/Qyzylorda",
      "id": "Asia/Qyzylorda"
  },
  {
      "label": "UTC+06:00 - Asia/Urumqi",
      "id": "Asia/Urumqi"
  },
  {
      "label": "UTC+06:00 - Etc/GMT-6",
      "id": "Etc/GMT-6"
  },
  {
      "label": "UTC+06:00 - Indian/Chagos",
      "id": "Indian/Chagos"
  },
  {
      "label": "UTC+06:00 - Asia/Dhaka",
      "id": "Asia/Dhaka"
  },
  {
      "label": "UTC+06:00 - Asia/Thimphu",
      "id": "Asia/Thimphu"
  },
  {
      "label": "UTC+06:30 - Asia/Rangoon",
      "id": "Asia/Rangoon"
  },
  {
      "label": "UTC+06:30 - Indian/Cocos",
      "id": "Indian/Cocos"
  },
  {
      "label": "UTC+07:00 - Antarctica/Davis",
      "id": "Antarctica/Davis"
  },
  {
      "label": "UTC+07:00 - Asia/Bangkok",
      "id": "Asia/Bangkok"
  },
  {
      "label": "UTC+07:00 - Asia/Hovd",
      "id": "Asia/Hovd"
  },
  {
      "label": "UTC+07:00 - Asia/Jakarta",
      "id": "Asia/Jakarta"
  },
  {
      "label": "UTC+07:00 - Asia/Phnom_Penh",
      "id": "Asia/Phnom_Penh"
  },
  {
      "label": "UTC+07:00 - Asia/Pontianak",
      "id": "Asia/Pontianak"
  },
  {
      "label": "UTC+07:00 - Asia/Saigon",
      "id": "Asia/Saigon"
  },
  {
      "label": "UTC+07:00 - Asia/Vientiane",
      "id": "Asia/Vientiane"
  },
  {
      "label": "UTC+07:00 - Etc/GMT-7",
      "id": "Etc/GMT-7"
  },
  {
      "label": "UTC+07:00 - Indian/Christmas",
      "id": "Indian/Christmas"
  },
  {
      "label": "UTC+07:00 - Asia/Novokuznetsk",
      "id": "Asia/Novokuznetsk"
  },
  {
      "label": "UTC+07:00 - Asia/Novosibirsk",
      "id": "Asia/Novosibirsk"
  },
  {
      "label": "UTC+07:00 - Asia/Omsk",
      "id": "Asia/Omsk"
  },
  {
      "label": "UTC+08:00 - Asia/Hong_Kong",
      "id": "Asia/Hong_Kong"
  },
  {
      "label": "UTC+08:00 - Asia/Macau",
      "id": "Asia/Macau"
  },
  {
      "label": "UTC+08:00 - Asia/Shanghai",
      "id": "Asia/Shanghai"
  },
  {
      "label": "UTC+08:00 - Asia/Krasnoyarsk",
      "id": "Asia/Krasnoyarsk"
  },
  {
      "label": "UTC+08:00 - Asia/Brunei",
      "id": "Asia/Brunei"
  },
  {
      "label": "UTC+08:00 - Asia/Kuala_Lumpur",
      "id": "Asia/Kuala_Lumpur"
  },
  {
      "label": "UTC+08:00 - Asia/Kuching",
      "id": "Asia/Kuching"
  },
  {
      "label": "UTC+08:00 - Asia/Makassar",
      "id": "Asia/Makassar"
  },
  {
      "label": "UTC+08:00 - Asia/Manila",
      "id": "Asia/Manila"
  },
  {
      "label": "UTC+08:00 - Asia/Singapore",
      "id": "Asia/Singapore"
  },
  {
      "label": "UTC+08:00 - Etc/GMT-8",
      "id": "Etc/GMT-8"
  },
  {
      "label": "UTC+08:00 - Antarctica/Casey",
      "id": "Antarctica/Casey"
  },
  {
      "label": "UTC+08:00 - Australia/Perth",
      "id": "Australia/Perth"
  },
  {
      "label": "UTC+08:00 - Asia/Taipei",
      "id": "Asia/Taipei"
  },
  {
      "label": "UTC+08:00 - Asia/Choibalsan",
      "id": "Asia/Choibalsan"
  },
  {
      "label": "UTC+08:00 - Asia/Ulaanbaatar",
      "id": "Asia/Ulaanbaatar"
  },
  {
      "label": "UTC+08:00 - Asia/Irkutsk",
      "id": "Asia/Irkutsk"
  },
  {
      "label": "UTC+09:00 - Asia/Dili",
      "id": "Asia/Dili"
  },
  {
      "label": "UTC+09:00 - Asia/Jayapura",
      "id": "Asia/Jayapura"
  },
  {
      "label": "UTC+09:00 - Asia/Tokyo",
      "id": "Asia/Tokyo"
  },
  {
      "label": "UTC+09:00 - Etc/GMT-9",
      "id": "Etc/GMT-9"
  },
  {
      "label": "UTC+09:00 - Pacific/Palau",
      "id": "Pacific/Palau"
  },
  {
      "label": "UTC+09:00 - Asia/Pyongyang",
      "id": "Asia/Pyongyang"
  },
  {
      "label": "UTC+09:00 - Asia/Seoul",
      "id": "Asia/Seoul"
  },
  {
      "label": "UTC+09:30 - Australia/Adelaide",
      "id": "Australia/Adelaide"
  },
  {
      "label": "UTC+09:30 - Australia/Broken_Hill",
      "id": "Australia/Broken_Hill"
  },
  {
      "label": "UTC+09:30 - Australia/Darwin",
      "id": "Australia/Darwin"
  },
  {
      "label": "UTC+10:00 - Australia/Brisbane",
      "id": "Australia/Brisbane"
  },
  {
      "label": "UTC+10:00 - Australia/Lindeman",
      "id": "Australia/Lindeman"
  },
  {
      "label": "UTC+10:00 - Australia/Melbourne",
      "id": "Australia/Melbourne"
  },
  {
      "label": "UTC+10:00 - Australia/Sydney",
      "id": "Australia/Sydney"
  },
  {
      "label": "UTC+10:00 - Antarctica/DumontDUrville",
      "id": "Antarctica/DumontDUrville"
  },
  {
      "label": "UTC+10:00 - Etc/GMT-10",
      "id": "Etc/GMT-10"
  },
  {
      "label": "UTC+10:00 - Pacific/Guam",
      "id": "Pacific/Guam"
  },
  {
      "label": "UTC+10:00 - Pacific/Port_Moresby",
      "id": "Pacific/Port_Moresby"
  },
  {
      "label": "UTC+10:00 - Pacific/Saipan",
      "id": "Pacific/Saipan"
  },
  {
      "label": "UTC+10:00 - Pacific/Truk",
      "id": "Pacific/Truk"
  },
  {
      "label": "UTC+10:00 - Australia/Currie",
      "id": "Australia/Currie"
  },
  {
      "label": "UTC+10:00 - Australia/Hobart",
      "id": "Australia/Hobart"
  },
  {
      "label": "UTC+09:00 - Asia/Chita",
      "id": "Asia/Chita"
  },
  {
      "label": "UTC+09:00 - Asia/Khandyga",
      "id": "Asia/Khandyga"
  },
  {
      "label": "UTC+09:00 - Asia/Yakutsk",
      "id": "Asia/Yakutsk"
  },
  {
      "label": "UTC+11:00 - Antarctica/Macquarie",
      "id": "Antarctica/Macquarie"
  },
  {
      "label": "UTC+11:00 - Etc/GMT-11",
      "id": "Etc/GMT-11"
  },
  {
      "label": "UTC+11:00 - Pacific/Efate",
      "id": "Pacific/Efate"
  },
  {
      "label": "UTC+11:00 - Pacific/Guadalcanal",
      "id": "Pacific/Guadalcanal"
  },
  {
      "label": "UTC+11:00 - Pacific/Kosrae",
      "id": "Pacific/Kosrae"
  },
  {
      "label": "UTC+11:00 - Pacific/Noumea",
      "id": "Pacific/Noumea"
  },
  {
      "label": "UTC+11:00 - Pacific/Ponape",
      "id": "Pacific/Ponape"
  },
  {
      "label": "UTC+11:00 - Asia/Sakhalin",
      "id": "Asia/Sakhalin"
  },
  {
      "label": "UTC+11:00 - Asia/Ust-Nera",
      "id": "Asia/Ust-Nera"
  },
  {
      "label": "UTC+11:00 - Asia/Vladivostok",
      "id": "Asia/Vladivostok"
  },
  {
      "label": "UTC+12:00 - Antarctica/McMurdo",
      "id": "Antarctica/McMurdo"
  },
  {
      "label": "UTC+12:00 - Pacific/Auckland",
      "id": "Pacific/Auckland"
  },
  {
      "label": "UTC+12:00 - Etc/GMT-12",
      "id": "Etc/GMT-12"
  },
  {
      "label": "UTC+12:00 - Pacific/Funafuti",
      "id": "Pacific/Funafuti"
  },
  {
      "label": "UTC+12:00 - Pacific/Kwajalein",
      "id": "Pacific/Kwajalein"
  },
  {
      "label": "UTC+12:00 - Pacific/Majuro",
      "id": "Pacific/Majuro"
  },
  {
      "label": "UTC+12:00 - Pacific/Nauru",
      "id": "Pacific/Nauru"
  },
  {
      "label": "UTC+12:00 - Pacific/Tarawa",
      "id": "Pacific/Tarawa"
  },
  {
      "label": "UTC+12:00 - Pacific/Wake",
      "id": "Pacific/Wake"
  },
  {
      "label": "UTC+12:00 - Pacific/Wallis",
      "id": "Pacific/Wallis"
  },
  {
      "label": "UTC+12:00 - Pacific/Fiji",
      "id": "Pacific/Fiji"
  },
  {
      "label": "UTC+12:00 - Asia/Anadyr",
      "id": "Asia/Anadyr"
  },
  {
      "label": "UTC+12:00 - Asia/Kamchatka",
      "id": "Asia/Kamchatka"
  },
  {
      "label": "UTC+12:00 - Asia/Magadan",
      "id": "Asia/Magadan"
  },
  {
      "label": "UTC+12:00 - Asia/Srednekolymsk",
      "id": "Asia/Srednekolymsk"
  },
  {
      "label": "UTC+13:00 - Etc/GMT-13",
      "id": "Etc/GMT-13"
  },
  {
      "label": "UTC+13:00 - Pacific/Enderbury",
      "id": "Pacific/Enderbury"
  },
  {
      "label": "UTC+13:00 - Pacific/Fakaofo",
      "id": "Pacific/Fakaofo"
  },
  {
      "label": "UTC+13:00 - Pacific/Tongatapu",
      "id": "Pacific/Tongatapu"
  },
  {
      "label": "UTC+13:00 - Pacific/Apia",
      "id": "Pacific/Apia"
  }
];

export default data;
