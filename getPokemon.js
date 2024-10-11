const fs = require("fs");
const csv = require("csvtojson");

const getPokemon = async () => {
  try {
    const pokemonData = await csv().fromFile("pokemon.csv");
    const results = pokemonData
      .map((data, index) => {
        const ImageURL = `http://coderdex-be-ame9.onrender.com/images/${
          index + 1
        }.png`;

        const imagePath = `./public/images/${index + 1}.png`;

        if (!fs.existsSync(imagePath)) {
          return null;
        }

        return {
          id: index + 1,
          name: data.Name,
          types: [data.Type1, data.Type2]
            .filter(Boolean)
            .map((type) => type.toLowerCase()),
          url: ImageURL,
        };
      })
      .filter(Boolean);

    const jsonData = {
      data: results,
      totalPokemons: results.length,
    };

    fs.writeFileSync("db.json", JSON.stringify(jsonData));
  } catch (err) {
    console.log(err);
  }
};

getPokemon();
