<?php
include('assets/includes/header.php'); ?>
<section>
    <div class="container-all-fd header-section container-fluid">
        <div class="row">
            <div class="col-12 head-title text-center">
                <h1 class="text-white">Contáctanos</h1>
            </div>
        </div>
    </div>
</section>
<!-- Aquí inicia el formulario de contacto -->
<section>
    <div class="container mt-4">
        <div class="row">
            <div class="col-12 mt-4">
                <h4 class="text-center">¡Tu próximo crédito se encuentra en SOFORTALEZA!</h4>
                <p>Contáctanos, te damos una asesoría sin costo, para que cuentes con nuestra experiencia y disponibilidad para responder todas tus dudas. Visítanos en nuestro domicilio ubicado en la Calle Montecito, número 38, piso 29 oficina 23, Colonia Nápoles, Alcaldía Benito Juárez, Ciudad de México, C.P. 03810.</p>
            </div>
        </div>
    </div>
    <div class="container">
        <form id="formDatos" enctype="multipart/form-data">
            <div class="row">
                <div class="contact_form">
                    <form action="" method="post">
                        <div class="row">
                            <div class="col-6">
                                <div class="form_group">
                                <i style="color: red;">*</i> <label for="">Nombre completo</label>
                                    <input type="text" class="form-control-fd form-control" placeholder="Nombre(s) y apellidos" name="name" required>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form_group">
                                <i style="color: red;">*</i> <label for="">Correo electrónico</label>
                                    <input type="email" class="form-control-fd form-control" placeholder="Correo electr&oacute;nico" name="email" required>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form_group">
                                    <i style="color: red;">*</i> <label for="">Teléfono</label>
                                    <input type="text" class="form-control-fd form-control" placeholder="Número telefónico a 10 dígitos" name="phone" required>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form_group">
                                <i style="color: red;">*</i> <label for="">Empresa</label>
                                    <input type="text" class="form-control-fd form-control" placeholder="¿En que empresa laboras?" required>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form_group">
                                    <label for="">Mensaje</label>
                                    <textarea name="mensaje" id="mensaje" class="form-control-fd form-control" placeholder="¿Cómo podemos ayudarte?" cols="30" rows="6"></textarea>
                                </div>
                            </div>
                            <div class="col-lg-12">
                                <div class="button_box">
                                    <button class="btn-fd btn deneb_btn btn-block">Enviar</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </form>
    </div>
</section>
<?php
include('assets/includes/footer.php');
?>