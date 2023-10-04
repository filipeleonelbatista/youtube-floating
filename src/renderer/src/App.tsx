import { useState } from 'react'
import { BsPin, BsPinAngle } from 'react-icons/bs'
import { FiMove, FiPlay } from 'react-icons/fi'
import { TfiBackLeft, TfiClose } from 'react-icons/tfi'
import { BiHelpCircle } from 'react-icons/bi'
import ReactPlayer from 'react-player'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'

function App(): JSX.Element {
  const [url, setUrl] = useState<string>('')
  const [errorText, setErrorText] = useState<string>('')
  const [isFixed, setIsFixed] = useState<boolean>(false)
  const [showVideo, setShowVideo] = useState<boolean>(false)

  const [isMoveWindow, setisMoveWindow] = useState(false)

  const [isDragging, setIsDragging] = useState(false)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)

  const handleMouseDown = (e) => {
    setIsDragging(true)
    const { screenX, screenY } = e
    const [x, y] = window.api.getPosition()
    setOffsetX(screenX - x)
    setOffsetY(screenY - y)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const { screenX, screenY } = e

    const [currentX, currentY] = window.api.getPosition()

    const newX = screenX - offsetX
    const newY = screenY - offsetY

    if (newX !== currentX || newY !== currentY) {
      window.electron.ipcRenderer.send('move-window', { x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  function verificaURLdoYouTube(url) {
    if (url === '') {
      setErrorText('Url está vazio!')
      return false
    }
    var regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    if (regex.test(url)) {
      var match = url.match(/[?&]v=([^&]+)/)
      if (match) {
        setErrorText('')
        return true
      } else if (url.indexOf('youtu.be/') !== -1) {
        setErrorText('')
        return true
      } else {
        setErrorText('URL do YouTube sem ID do vídeo')
        return false
      }
    } else {
      setErrorText('URL não é do YouTube')
      return false
    }
  }

  const handleShowVideo = async () => {
    if (!verificaURLdoYouTube(url)) {
      return
    }
    setShowVideo(true)
  }

  const handleReset = async () => {
    setShowVideo(false)
    setUrl('')
  }

  const handleClose = () => {
    if (window.confirm('Deseja fechar o aplicativo?')) {
      window.api.closeWindow()
    }
  }

  const handlePin = () => {
    window.api.pin(!isFixed)
    setIsFixed(!isFixed)
  }

  const handleHelp = () => {
    const message = `Ajuda!

    - Para iniciar, cole um link do youtube válido no campo descrito e pressione
    o botão com o icone do play.
    - Ao colar um link de playlist do youtube o app tocará a playlist toda.
    - Se colocar o link de um vídeo toca apenas o vídeo.
    - O botão de pin ao lado superior direito fixa a janela sobre todas as outras.
    - Após inicar o vídeo aparecerá um botão de voltar que irá parar o vídeo 
    e retornar para a tela inicial.
    - Se quiser redimensionar a janela só posicionar o mouse em um dos cantos
    e redimensionar, ela irá manter o aspecto 16:9 de video sempre.
    - Para arrastar a janela clique no botão com as setas para todos os 
    lados (Botão de mover), clique e arraste para a posição desejada.

    para mais detalhes acesse https://filipeleonelbatista.vercel.app/links

    Ver.: ${window.api.appVersion}
    `
    alert(message)
  }

  return (
    <div className="flex rounded-md relative overflow-hidden bg-zinc-950 w-full items-center justify-center aspect-video">
      {isMoveWindow ? (
        <div
          id="dragButton"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`cursor-grab active:cursor-grabbing z-50 flex flex-col space-y-2 items-center justify-center absolute p-2 bg-zinc-900/90 w-screen h-screen`}
        >
          <div
            onClick={() => setisMoveWindow(false)}
            className={`cursor-pointer z-[100] absolute p-2 top-0 left-0 hover:bg-red-600`}
          >
            <TfiBackLeft className="w-4 h-4" />
          </div>

          <FiMove className="w-4 h-4" />
          <p>Clique para mover a tela</p>
        </div>
      ) : (
        <div
          onClick={() => setisMoveWindow(true)}
          className={`cursor-grab active:cursor-grabbing absolute p-2 top-0 left-0 hover:bg-zinc-900`}
        >
          <FiMove className="w-4 h-4" />
        </div>
      )}
      <div
        onClick={handleHelp}
        className="cursor-pointer absolute p-2 left-8 top-0 hover:bg-yellow-600"
      >
        <BiHelpCircle className="w-4 h-4" />
      </div>
      <div
        onClick={handlePin}
        className="cursor-pointer absolute p-2 right-16 top-0 hover:bg-cyan-600"
      >
        {isFixed ? <BsPin className="w-4 h-4" /> : <BsPinAngle className="w-4 h-4" />}
      </div>
      {showVideo && (
        <div
          onClick={handleReset}
          className="cursor-pointer absolute p-2 top-0 right-8 hover:bg-green-600"
        >
          <TfiBackLeft className="w-4 h-4" />
        </div>
      )}
      <div
        onClick={handleClose}
        className="cursor-pointer absolute p-2 top-0 right-0 hover:bg-red-600 rounded-tr-md"
      >
        <TfiClose className="w-4 h-4" />
      </div>
      {showVideo ? (
        <div className="flex w-full h-full overflow-hidden rounded-md items-center">
          <ReactPlayer onEnded={handleReset} width="100%" height="100%" controls={true} url={url} />
        </div>
      ) : (
        <div className="flex w-full flex-col space-y-4 items-center">
          <Label htmlFor="url" className="text-left">
            Cole a URL do vídeo
          </Label>
          <div className="flex flex-row space-x-2">
            <Input
              value={url}
              onChange={(event) => {
                setUrl(event.target.value)
                setErrorText('')
              }}
              id="url"
              className="w-3/4"
              placeholder="Cole a url do video aqui"
            />
            <Button onClick={handleShowVideo} variant="outline">
              <FiPlay className="w-4 h-4" />
            </Button>
          </div>
          {errorText !== '' && <p className="text-sm text-red-600">{errorText}</p>}
        </div>
      )}
      {!showVideo && (
        <a
          href="https://filipeleonelbatista.vercel.app/links"
          target="_blank"
          className="absolute cursor-pointer p-3 bottom-0 w-full text-center text-xs text-muted-foreground hover:text-white"
        >
          Feito com 💜 por Filipe Batista
        </a>
      )}
    </div>
  )
}

export default App
