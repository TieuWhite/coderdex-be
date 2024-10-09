const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/pokemons", (req, res) => {
  const { type, search } = req.query;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }

    let pokemons = JSON.parse(data).data;

    try {
      if (type) {
        pokemons = pokemons.filter((pokemon) => pokemon.types.includes(type));
      }

      if (search) {
        const lowerCaseName = search.toLowerCase();
        pokemons = pokemons.filter((pokemon) =>
          pokemon.name.includes(lowerCaseName)
        );
      }
    } catch (parseError) {
      console.error("Error parsing JSON data:", parseError);
      res.status(500).send("Error parsing JSON data");
      return;
    }
    res.json(pokemons);
  });
});

app.get("/pokemons/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }

    let pokemons = JSON.parse(data).data;

    try {
      const pokemonId = parseInt(id);
      const totalPokemons = pokemons.length;

      const previousPokemon = pokemons.find(
        (pokemon) =>
          pokemon.id === (pokemonId === 1 ? totalPokemons : pokemonId - 1)
      );
      const currentPokemon = pokemons.find(
        (pokemon) => pokemon.id === pokemonId
      );
      const nextPokemon = pokemons.find(
        (pokemon) =>
          pokemon.id === (pokemonId === totalPokemons ? 1 : pokemonId + 1)
      );

      const response = {
        data: {
          pokemon: currentPokemon,
          previousPokemon: previousPokemon,
          nextPokemon: nextPokemon,
        },
      };

      if (!response) {
        res.status(404).send("Pokemon not found");
      }

      res.json(response);
    } catch (parseError) {
      console.error("Error parsing JSON data:", parseError);
      res.status(500).send("Error parsing JSON data");
      return;
    }
  });
});

app.post("/pokemons", (req, res) => {
  const pokemonTypes = [
    "bug",
    "dragon",
    "fairy",
    "fire",
    "ghost",
    "ground",
    "normal",
    "psychic",
    "steel",
    "dark",
    "electric",
    "fighting",
    "flyingText",
    "grass",
    "ice",
    "poison",
    "rock",
    "water",
  ];

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }

    let pokemons = JSON.parse(data).data;

    const newPokemon = req.body;

    if (
      !newPokemon.id ||
      !newPokemon.name ||
      !newPokemon.url ||
      !newPokemon.types
    ) {
      res.status(400).send("please fill all the fields");
      return;
    }

    if (
      !newPokemon.types.every((type) =>
        pokemonTypes.includes(type.toLowerCase())
      )
    ) {
      res.status(400).send("Invalid Pokemon type");
      return;
    }

    if (
      pokemons.find((pokemon) => pokemon.id == newPokemon.id) ||
      pokemons.find((pokemon) => pokemon.name === newPokemon.name)
    ) {
      res.status(400).send("Pokemon already exists");
      return;
    }

    pokemons.push(newPokemon);

    const jsonData = {
      data: pokemons,
      totalPokemons: pokemons.length,
    };

    fs.writeFileSync("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        res.status(500).send("Internal Server Error");
        return;
      }
    });
    res.json(newPokemon);
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
