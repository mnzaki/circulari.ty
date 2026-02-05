<!-- vim: ts=2 sw=2
-->

# Circulari.ty

`Circles` are for people, information about their activities, and collaborative
decisions.

`Circles` create `Squares`.

`Squares` are for content. A `Square` can act as an FB/IG page, or a blog, or a
tumblr, or a forum, or a wiki, etc

## Server Nodes

Server nodes are based on https://karrot.world (code at
[codeberg](https://codeberg.org/karrot)).
Expected to be deployed at homes, offices, pubs, gyms, etc

Identities are based on [KERI](https://keri.one) and stored in karrot's
postgres. AID stands for "Autonomous IDentity" which is an identity that uses
the KERI protocol. KEL stands for "Key Event Log", which is the datastructure
that holds information about an AID.

### Identity Servers

These are necessary for sybil attack protection.
Main function of identity confirmation server is to confirm emails and issue
proof-of-email (possibly as JWT? or embedded in KEL?)

At first 1 global server is sufficient, but later a network of them to support features
of KERI that require a network (more secure key revocation/rotation, and
potentially identity backups)

## User flow

### Sign up and Log in

- user sends AID and email address to identity server
- identity server confirms email and sends back proof-of-email
- proof-of-email is saved by user's device
- log in to a karrot by sending AID, proof-of-email, and optionally home karrot address.

### Engage socially

- create `Circles` ("Groups" in karrot): highest level organizational unit
- create `Squares` ("Places" in karrot): containers of activity
- create content in `Squares`
  - `Posts`
  - `Polls`
  - `Places` (points of interest on map, also "Places" in karrot)
  - `Events` ("Activities" in karrot)
  - `Offers`: like FB marketplace
  - `Agreements`: that can de discussed and signed by members
  - `Forums` (not implemented in karrot)

## Monetization

1. Custom digital experiences in physical spaces
  - QR codes that lead to a "custom user journey" which ends at a Square that is run by a
    Circle of the owners/managers/keepers of the location (bar, gym, club,
    sauna, coworking space, etc)
    - "custom user journey" is a fancy custom Single Page App, for example:
      - Ask questions, create a "local public profile" for the user, give tips,
        introduce the event, advertise facilities, present menu, etc

2. Allow patrons of a physical space that hosts a Square to ask for ad space in
the square, and circulari.ty gets a fair cut.

## Decentralizing the network

- Add content signatures by users
- Allow users to discover each other on wifi networks and create circles

## More features

- `Sister Servers` are karrots configured to mirror each other. Entire postgres
  schema is replicated between them, which is useful for backups, offline
  viewing, and solidarity.
- karrot django plugin to expose karrot groups (that choose
  that) as [scuttlebutt](https://scuttlebutt.nz) feeds and participates in the
  SSB network
  - comments on posts get synced

# Reference software

- [Liqd](https://liqd.net)'s [Adhocracy+](https://adhocracy.plus) with code on
  [github](https://github.com/liqd/adhocracy-plus)
- [Loomio](https://loomio.com) is a collaborative decision making software.
  Code on [github](https://github.com/loomio/loomio) and
  info on [wikipedia](https://en.wikipedia.org/wiki/Loomio)
- [Argüman](https://arguman.org) is an argument tree software.  Code on
  [github](https://github.com/arguman/arguman.org) and info on
  [wikipedia](https://en.wikipedia.org/wiki/Arg%C3%BCman)
