const utils = require('./utils')

const faves = {
  "Redder": {
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Don't Look Back": {
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Anodyne": {
    finished: false,
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Every Day the Same Dream": {
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Luxuria Superbia": {
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Passage": {
    acclaim: [ 'underrated' ],
  },
  "Yume Nikki": {
    finished: false,
    played: false,
    acclaim: [ 'underrated' ],
  },
  "Parau the Arrow Man": {
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Pico-8 games (numerous)": {
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Windosill": {
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Desert Golf": {
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Super Hexagon": {
    acclaim: [ 'underrated' ],
  },
  "Odin Sphere": {
    finished: false,
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Space Paws": {
    nsfw: true,
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Anatomy": {
    finished: false,
    acclaim: [ 'underrated', 'obscure' ],
  },
  "Marathon": {
    acclaim: [ 'underrated' ],
  },
  "Pikmin": {
    acclaim: [ 'misunderstood', 'justified' ],
  },
  "Braid": {
    acclaim: [ 'misunderstood', 'justified' ],
  },
  "Portal": {
    acclaim: [ 'misunderstood', 'justified' ],
  },
  "Luigi's Mansion": {
    acclaim: [ 'misunderstood', 'justified' ],
  },
  "Silent Hill 3": {
    acclaim: [ 'misunderstood', 'justified' ],
    finished: false,
  },
  "Silent Hill 4" : {
    acclaim: [ 'misunderstood', 'justified' ],
    finished: false,
  },
  "Silent Hill 2": {
    acclaim: [ 'justified' ],
  },
  "Shadow of the Colossus": {
    acclaim: [ 'justified' ],
  },
  "Portal": {
    acclaim: [ 'justified' ],
  },
  "SimCity": {
    acclaim: [ 'justified' ],
  },
  "Cookie Clicker": {
    acclaim: [ 'justified', 'misunderstood' ],
  },
  "Bastion": {
    acclaim: [ 'justified' ],
  },
  "Neir: Automata": {
    finished: false,
    acclaim: [ 'justified' ],
  },
  "Subnautica": {
    acclaim: [ 'justified' ],
  },
  "Sea of Stars": {
    acclaim: [ 'justified' ],
  },
  "Chrono Trigger": {
    finished: false,
    acclaim: [ 'justified' ],
  },
  "Super Mario": {
    acclaim: [ 'justified' ],
  },
  "Tetris": {
    acclaim: [ 'justified' ],
  },
  "Super Mario World": {
    acclaim: [ 'justified' ],
  },
  "Journey": {
    acclaim: [ 'justified' ],
  },
  "Flow": {
    acclaim: [ 'justified' ],
  },
  "Amnesia: The Dark Descent": {
    acclaim: [ 'justified' ],
  },
  "Silent Hill 2": {
    acclaim: [ 'justified' ],
  },
  "Summertime Saga": {
    nsfw: true,
    acclaim: [ 'justified' ],
  },
  "Doki Doki Literature Club": {
    acclaim: [ 'justified' ],
  },
  "Gone Home": {
    finished: false,
    acclaim: [ 'justified' ],
  },
  "Dust: an Elysian Tale": {
    acclaim: [ 'justified' ],
  },
  "Inside": {
    acclaim: [ 'justified' ],
  },
  "Ico": {
    acclaim: [ 'justified' ],
  },
  "Dear Esther": {
    acclaim: [ 'justified' ],
  },
  "Golden Sun": {
    acclaim: [ 'justified' ],
  },
  "Undertale": {
    acclaim: [ 'justified' ],
  },
  "Deltarune": {
    finished: false,
    acclaim: [ 'justified' ],
  },
  "Inscryption": {
    acclaim: [ 'justified' ],
  },
  "Earthbound": {
    finished: false,
    played: false,
    acclaim: [ 'justified' ],
  },
  "Final Fantasy Tactics": {
    finished: false,
    acclaim: [ 'justified' ],
  },
  "Final Fantasy 6": {
    acclaim: [ 'justified' ],
  },
}
const sorted = Object.keys(faves).sort(utils.getSorter())
console.log(sorted)

const oldWay = Object.entries(faves).map(([key, value]) => ({ ...value, name: key }))
const oldResult = utils.recombine(oldWay, (obj) => obj.acclaim).justified
// TODO: alllllll this
const acclaimed = utils.recombine(faves, 'acclaim').justified
console.log(acclaimed)

