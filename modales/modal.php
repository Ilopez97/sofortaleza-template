<!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="exampleModalLabel">Captura de vídeo <i class="fa fa-video "></i></h3>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-bs-label="Close">
                </button>
            </div>
            <div class="modal-body">

                <div class="col-12">
                    <div class="form_group">
                        <div class="row">
                            <div class="col-md-6">
                                <label for="dispositivosDeAudio">Seleccione un Micrófono:</label><br>
                                <select name="dispositivosDeAudio" id="dispositivosDeAudio" class="form-control"></select>
                            </div>
                            <div class="col-md-6">
                                <label for="dispositivosDeVideo">Seleccione una Cámara:</label><br>
                                <select name="dispositivosDeVideo" id="dispositivosDeVideo" class="form-control"></select>
                            </div>
                        </div>
                    </div>
                </div> <br>
                <div class="col-12">
                    <div class="form_group">
                        <p>
                            <b>La grabación que realice deberá contar con las siguientes características:</b> <br><br>
                            1. Deberá realizar la grabación en un espacio aislado de ruido, preferentemente con fondo blanco, con un ángulo en el cual se pueda obtener una vista a partir del pecho. <br><br>
                            2. Durante la grabación, deberá mostrar durante 5 segundos, tanto por el lado anverso como por el reverso:
                            • Identificación oficial vigente (deberá coincidir con la adjuntada previamente), sujetándola a una altura entre la barbilla y el cuello (tal cómo en la foto selfie). <br>


                        </p>
                    </div> <br>
                </div>
                <div class="row">
                    <div class="col-md-12 col-sm-12">
                        <div class="form_group">
                            <h5>Graba un vídeo leyendo el siguiente texto:</h5>
                            <div class="card-body" style="border-radius: 15px; background:#f2f2f2">
                                Yo, <span class="Nombre_completo"></span> acepto que Sofortaleza me pueda otorgar un crédito por <span class="Anticipo2"></span> pesos, y que efectuaré el pago en una sola exhibición vía descuento en mi siguiente período de pago.
                            </div> 
                            <div>
                            3. Después de leer el texto debe realizar los siguientes movimientos de rostro:
                            <ul>
                                <li>
                                    Gire a la izquierda
                                </li>
                                <li>
                                    Gire a la derecha
                                </li>
                                <li>
                                    Gire a hacía arriba
                                </li>
                                <li>
                                    Gire a hacía abajo
                                </li>
                            </ul>
                        </div>
                            Cuentas con un <strong> máximo de 25 segundos</strong> 
                        </div>
                       


                    </div>
                    <div class="col-md-12 col-sm-12">
                        <div class="form_group">
                            <div>
                                <video playsinline muted="muted" name="video" id="video" style="border:1px solid black; background: whitesmoke; border-radius:10px; width: 100%; max-height: 100%;" required> </video>

                                <div style="position: relative; display: none;" id="video_prev">
                                    <label style=" position: absolute; z-index: 9; color: white; margin-top: 5px; margin-left: 5px;">Vista previa</label>
                                    <video controls name="video_prev" id="video_prev2" style="border:2px solid black; border-radius:10px; width: 100%; max-height: 100%; ">
                                        <source src="" type="video/mp4" />
                                    </video>

                                </div>
                                <p id="duracion"></p> &nbsp; &nbsp; &nbsp; <span id="hora_fecha"></span> 

                                <div class="row" style="text-align: center;">
                                    <div class="col-md-4">
                                        <button id="btnComenzarGrabacion" class="btn btn-fd  deneb_btn btn-block" style="min-width: 60px; font-size:13px;">Iniciar Grabación</button>
                                    </div>
                                    <div class="col-md-4">
                                        <button id="btnDetenerGrabacion" class="btn btn-sec  deneb_btn btn-block" style="display: none; min-width: 60px; font-size:13px;">Detener Grabación</button>
                                    </div>
                                    <div class="col-md-4">
                                        <button id="btnReiniciarGrabacion" class="btn btn-fd  deneb_btn btn-block" style="display: none; min-width: 60px; font-size:13px;">Reiniciar Grabación</button>
                                    </div>



                                </div>


                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-fd" id="btn_aceptar" style="display: none;" data-bs-dismiss="modal">Aceptar</button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="modalINE" tabindex="-1" role="dialog" aria-labelledby="modalINE" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="exampleModalLabel">¿Cómo saber CIC y el ID de Ciudadano en mi INE? <i class="fa fa-document "></i></h4>
            </div>
            <div class="modal-body">
                <div class="col-12">
                    <div class="form_group">
                        <div>
                            <img src="assets/images/ine.png" alt="ine" style="width: 100%;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="button btn_aceptar" data-dismiss="modal">Aceptar</button>
            </div>
        </div>
    </div>
</div>