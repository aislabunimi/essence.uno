export default class Card {
  constructor(
    scene,
    cardRep,
    x,
    y,
  ) {
    const card = scene.add.image(x, y, cardRep.name).setScale(0.45);
    card.rep = cardRep;

    /* const cardSplit = cardName.split('_');

    card.rep = {
      name: cardName,
      color: cardSplit[0],
      type: cardSplit[1],
    }; */

    return card;
  }
}