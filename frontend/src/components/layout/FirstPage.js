import React, { Component } from 'react'

export class FirstPage extends Component {
  render() {
    return (
        <div class="container">
          <div class="img" style={{height: "100vh", backgroundImage: 'url(https://kartinki.pics/uploads/posts/2022-03/1646234846_37-kartinkin-net-p-proekt-kartinki-40.png)', backgroundPosition: "center", backgroundSize: "cover"}} alt=""></div>
          <div class="h1-main" style={{backgroundColor: "rgba(255, 255, 255, 0.5)", padding: "20px"}}>
              <h1 style={{color: '#00AEEF', fontWeight: "900", fontSize: "86px", lineHeight: "105px"}}>Сформируй команду для своего IT-проекта</h1>
          </div>

        </div>
    )
  }
}

export default FirstPage