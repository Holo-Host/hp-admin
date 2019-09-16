**React Identicon Variety Pack!** is a react component that displays one of a selection of different identicons. It's useful for turning hard to read computer data (like a cryptographic key) into a form that's easily recognizable for humans. [Here's an overview of the subject](https://barro.github.io/2018/02/avatars-identicons-and-hash-visualization/).

## Live demo
Here's a [live demo](https://robbiecarlton.github.io/react-identicon-variety-pack/) for you to play with.

## Installation

`yarn add react-identicon-variety-pack`

## Usage

```
import { Network as Identicon } from 'react-identicon-variety-pack'

<Identicon
  size={64}
  seed={'yourpublickeyorhash'}
/>
```

## Available styles
These are the component names, so you can eg `import { Blockies } from 'react-identicon-variety-pack'`.

### Network
![Network style identicons](https://user-images.githubusercontent.com/891124/62013002-58fa3680-b14a-11e9-8a68-f961e8ba41f2.png)

### Bishop
Based on [the algorithm](https://aarontoponce.org/drunken_bishop.pdf) used for ssh visual keys.
![Bishop style identicons](https://user-images.githubusercontent.com/891124/62013017-87781180-b14a-11e9-9b84-e6ee4a07ad6f.png)

### Rings
![Rings style identicons](https://user-images.githubusercontent.com/891124/62013041-d756d880-b14a-11e9-93e7-a1844fb43409.png)

### Blockies
Based on [this library](https://github.com/download13/blockies).
![Blockies style identicons](https://user-images.githubusercontent.com/891124/62013046-eb023f00-b14a-11e9-994a-d81bbf17ebc3.png)

### Network Large
![Network Large style identicons](https://user-images.githubusercontent.com/891124/62013049-fd7c7880-b14a-11e9-9a16-07f370693844.png)

### Discs
![Discs style identicons](https://user-images.githubusercontent.com/891124/62013057-0a996780-b14b-11e9-8102-40e40200e24b.png)

## Props

### seed
random seed that generates the image.

### size
size in pixels

### gridSize
number of rows and columns in grid *(only relevant for Blockies and Bishop)*.

### scale
size of each gird cell in pixes *(only relevant for Blockies and Bishop)*.

## A note about security
With the (qualified) exception of Bishop<sup>*</sup>, these algorithms have **not** been studied for how well behaved they are as hashing functions, with regard to the three properties of preimage resistance, 2nd-preimage resistance and collision resistance. This means I can make no gaurantees about how easy it would be to spoof one of these by finding a seed that generates an image sufficiently close to a desired image. My guess is it would be very hard with any of them, but that's not backed by research. So if you are using these as part of a security protocol, you will have to satisfy yourself that they meet your requirements.

*\* "Qualified" because while Bishop *has* been studied, it was the ascii art version that was studied. The version presented here is a pixel art version and has very different visual properties.*

[More discussion here](https://netsec.ethz.ch/publications/papers/validation.pdf).

