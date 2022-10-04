const fs = require("fs");
var imgGen = require("js-image-generator");

for (var i = 0; i < 100; i++) {
  imgGen.generateImage(500, 500, 100, function (err, image) {
    fs.writeFileSync(`assets/${i}.png`, image.data);
    const meta = {
      name: "Random Noise NFT #" + i,
      symbol: "RSNFT",
      description: "Random Noise NFTs",
      image: `${i}.png`,
      attributes: [
        {
          trait_type: "Associated Random Number",
          value: `${Math.floor(Math.random() * (100 - 1) + 1)}`,
        },
        {
          trait_type: "Associated Random Color",
          value: "#" + Math.floor(Math.random() * 16777215).toString(16),
        },
      ],
      properties: {
        files: [
          {
            uri: `${i}.png`,
            type: "image/png",
          },
        ],
      },
    };
    fs.writeFileSync(`assets/${i}.json`, JSON.stringify(meta, null, 2));
  });

  imgGen.generateImage(500, 500, 100, function (err, image) {
    fs.writeFileSync(`assets/collection.png`, image.data);
    const meta = {
      name: "Random Noise NFT Collection",
      symbol: "RSNFT",
      description: "Random Noise NFTs",
      image: `collection.png`,
      attributes: [],
      properties: {
        files: [
          {
            uri: `collection.png`,
            type: "image/png",
          },
        ],
      },
    };
    fs.writeFileSync(`assets/collection.json`, JSON.stringify(meta, null, 2));
  });
}
