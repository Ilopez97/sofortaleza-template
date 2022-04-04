<div class="modal fade" id="modalEmp" tabindex="-1" role="dialog" aria-labelledby="modalEmp" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="exampleModalLabel">Formato de colaboradores incorrecto. <i class="fa fa-document "></i></h3>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-bs-label="Close">
            </div>
            <div class="modal-body">
                <div class="col-12">
                    <div id="datosVacios" style="display: none;">
                        <h5>Favor de llenar los siguientes campos en el formato de colaboradores.</h5>
                        <div class="form_group">
                            <div id="listaEmp"> <br>

                            </div>
                        </div> <br>
                        <h5>Una vez completado intente cargarlo de nuevo.</h5>
                    </div>
                    <div id="datosIncorrectos" style="display: none;">
                        <br>

                        <h5>Favor de verificar los siguientes datos incorrectos en el formato de colaboradores:</h5>
                        <div class="form_group">
                            <div id="listaEmpDatos"> 

                            </div>
                        </div> <br>
                      
                    </div>
                    <div id="datosDuplicados" style="display: none;">
                    <br>

                        <h5>Favor de verificar los siguientes datos duplicados en el formato de colaboradores:</h5>
                        <div class="form_group">
                        
                            <div id="listaEmpDups"> 

                            </div>
                        </div> <br>
                        <h5>Una vez verificado intente cargarlo de nuevo.</h5>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-fd" data-bs-dismiss="modal">Aceptar</button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="modalResumen" tabindex="-1" role="dialog" aria-labelledby="modalResumen" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="exampleModalLabel">Resumen de carga de colaboradores. <i class="fa fa-document "></i></h3>
                <button type="button" class="btn-close btnCloseResumen"  aria-bs-label="Close">
            </div>
            <div class="modal-body">
                <div class="col-12">
                    <div id="unique" style="display: block;">
                        <h6>Colaboradores cargados exitosamente: <b><span id="spEmp"></span></b> de <b><span id="spEmpTotal"></span></b>.</h6>
                        <br>
                    </div>
                    <div id="sended" style="display: block;">
                    <h6>Correos enviados: <b> <span id="spSend"></span></b> de <b><span id="spEmail"></span></b> .</h6>
                        <br>
                    </div>
                    <div id="Duplicados" style="display: none;">
                        <h6>Colaboradores con datos duplicados.</h6>
                        <div class="form_group">
                        
                            <div id="listaDups"> 

                            </div>
                        </div> <br>
                    </div>
                    <div id="Emails" style="display: none;">
                        <h6>Correos no enviados.</h6>
                        <div class="form_group">
                        
                            <div id="listaEmails"> 

                            </div>
                        </div> <br>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-fd btnCloseResumen">Aceptar</button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="modalallEmp" tabindex="-1" role="dialog" aria-labelledby="modalEmp" aria-hidden="true">
    <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="exampleModalLabel">Colaboradores existentes. <i class="fa fa-document "></i></h3>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-bs-label="Close">
            </div>
            <div class="modal-body">
                <div class="col-12">
                    <div class="form-group">
                        <div class="table-responsive" style="text-align: center; width:100%">
                        <table class="table" id="tablaColaboradores" style=" background: white; border-radius:20px;" >
                            <thead style="background: #1B4F5D; color:white">
                                <tr>
                                    <th>NoEmpleado</th>
                                    <th>RFC</th>
                                    <th>Clave</th>
                                    <th>Expiracion de Clave</th>
                                    <th>RFC Empresa</th>
                                    <th>RFC Pagadora</th>
                                    <th>CURP</th>
                                    <th>Nombres</th>
                                    <th>APaterno</th>
                                    <th>AMaterno</th>
                                    <th>Calle</th>
                                    <th>NoInt</th>
                                    <th>NoExt</th>
                                    <th>Colonia</th>
                                    <th>CP</th>
                                    <th>Ciudad</th>
                                    <th>Municipio</th>
                                    <th>Estado</th>
                                    <th>Ingreso Neto</th>
                                    <th>Puesto</th>
                                    <th>Celular</th>
                                    <th>Fecha Ingreso del Colaborador</th>
                                    <th>Correo</th>
                                    <th>Banco</th>
                                    <th>CLABE Interbancaria</th>
                                    <th>NSS</th>
                                    <th>Periodicidad del pago</th>
                                    <th>Anticipo</th>
                                    <th>Credito a Plazos</th>
                                </tr>
                            </thead>
                        </table>
                        </div>
                        
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>