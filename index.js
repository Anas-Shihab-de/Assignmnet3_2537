
const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=1500"

let firstCard = null
let secondCard = null

let lockBoard = false

let clicks = 0
let matchedPairs = 0
let totalPairs = 0

let timer = 0
let timerInterval = null

let gameStarted = false

const difficulties = {
  easy: {
    pairs: 3,
    time: 60
  },
  medium: {
    pairs: 6,
    time: 45
  },
  hard: {
    pairs: 10,
    time: 30
  }
}

async function fetchPokemon() {

  const response = await fetch(API_URL)

  const data = await response.json()

  return data.results
}

function shuffle(array) {

  for (let i = array.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1))

    ;[array[i], array[j]] = [array[j], array[i]]
  }

  return array
}

async function startGame() {

  clearInterval(timerInterval)

  $("#message").text("")

  $("#game_grid").empty()

  clicks = 0
  matchedPairs = 0

  updateStats()

  const difficulty = $("#difficulty").val()

  totalPairs = difficulties[difficulty].pairs

  timer = difficulties[difficulty].time

  $("#timer").text(timer)

  const pokemon = await fetchPokemon()

  const selected = shuffle([...pokemon]).slice(0, totalPairs)

  const cards = [...selected, ...selected]

  shuffle(cards)

  cards.forEach((poke, index) => {

    const image =
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(poke.url)}.png`

    const card = $(`
      <div class="card" data-name="${poke.name}">
        <img class="front_face" src="${image}">
        <img class="back_face" src="back.webp">
      </div>
    `)

    $("#game_grid").append(card)
  })

  addCardEvents()

  startTimer()

  gameStarted = true

  updateStats()
}

function getPokemonId(url) {
  return url.split("/").filter(Boolean).pop()
}

function addCardEvents() {

  $(".card").on("click", function () {

    if (!gameStarted) return

    if (lockBoard) return

    if ($(this).hasClass("flip")) return

    $(this).addClass("flip")

    clicks++

    $("#clicks").text(clicks)

    if (!firstCard) {

      firstCard = $(this)

      return
    }

    secondCard = $(this)

    checkMatch()
  })
}

function checkMatch() {

  const isMatch =
    firstCard.data("name") === secondCard.data("name")

  if (isMatch) {

    firstCard.addClass("matched")
    secondCard.addClass("matched")

    firstCard.off("click")
    secondCard.off("click")

    matchedPairs++

    updateStats()

    resetTurn()

    checkWin()

  } else {

    lockBoard = true

    setTimeout(() => {

      firstCard.removeClass("flip")
      secondCard.removeClass("flip")

      resetTurn()

    }, 1000)
  }
}

function resetTurn() {

  firstCard = null
  secondCard = null
  lockBoard = false
}

function updateStats() {

  $("#clicks").text(clicks)

  $("#pairsMatched").text(matchedPairs)

  $("#pairsLeft").text(totalPairs - matchedPairs)

  $("#totalPairs").text(totalPairs)
}

function startTimer() {

  clearInterval(timerInterval)

  timerInterval = setInterval(() => {

    timer--

    $("#timer").text(timer)

    if (timer <= 0) {

      clearInterval(timerInterval)

      gameOver()
    }

  }, 1000)
}

function checkWin() {

  if (matchedPairs === totalPairs) {

    clearInterval(timerInterval)

    $("#message").text("got all right!")
  }
}

function gameOver() {

  $(".card").off("click")

  $("#message").text("lose")
}

function resetGame() {

  clearInterval(timerInterval)

  $("#game_grid").empty()

  $("#message").text("")

  gameStarted = false

  clicks = 0
  matchedPairs = 0
  totalPairs = 0

  updateStats()

  $("#timer").text("0")
}

function applyTheme(theme) {

  $("body")
    .removeClass("theme-classic theme-dark theme-fire")
    .addClass(`theme-${theme}`)
}

function revealPowerUp() {

  if (lockBoard) return

  $(".card").addClass("flip")

  setTimeout(() => {

    $(".card").not(".matched").removeClass("flip")

  }, 2000)
}

$(document).ready(function () {

  $("#startBtn").on("click", startGame)

  $("#resetBtn").on("click", resetGame)

  $("#theme").on("change", function () {

    applyTheme($(this).val())
  })

  $("#revealBtn").on("click", revealPowerUp)
})