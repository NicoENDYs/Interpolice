import '../scss/style.scss'
import Loguito from '/USSF.png'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="../login.html" target="_blank">
      <img src="${Loguito}" class="logo" alt="Vite logo"  width="100" height="100" />
    </a>
    <h1>Bienvenido al Sistema de la USSF</h1>
    <h2>United States Space Force</h2>
    <p>click en la imagen para continuar</p>
  </div>
`
