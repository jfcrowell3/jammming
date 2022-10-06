let accessToken = "";
const clientID = "<clientId>";
const redirectURI = "http://jammmin_with_jfcrowell3.surge.sh/";

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}
`;
      window.location = accessUrl;
    }
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => {
        return response.json();
      })
      .then((jsonResponse) => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri,
        }));
      });
  },

  savePlaylist(playlistName, trackUriArray) {
    if (!playlistName || !trackUriArray.length) {
      return;
    } else {
      const accessToken = Spotify.getAccessToken();
      const headers = { Authorization: `Bearer ${accessToken}` };
      let userID;
      let playlistId;
      return fetch("https://api.spotify.com/v1/me", { headers: headers })
        .then((response) => response.json())
        .then((jsonResponse) => {
          userID = jsonResponse.id;
          return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
            headers: headers,
            method: "POST",
            body: JSON.stringify({ name: playlistName }),
          })
            .then((response) => response.json())
            .then((jsonResponse) => {
              playlistId = jsonResponse.id;
              console.log(trackUriArray);
              return fetch(
                `https://api.spotify.com/v1/users/${userID}/playlists/${playlistId}/tracks
`,
                {
                  headers: headers,
                  method: "POST",
                  body: JSON.stringify({ uris: trackUriArray }),
                }
              );
            });
        });
    }
  },
};

export default Spotify;
