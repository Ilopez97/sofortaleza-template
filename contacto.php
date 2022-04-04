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
        
            <div class="row">
                <div class="contact_form">
                    <form id="contacto" action="#" method="post">
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
                                    <input type="number" class="form-control-fd form-control" placeholder="Número telefónico a 10 dígitos" name="phone" required>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form_group">
                                <i style="color: red;">*</i> <label for="">Empresa</label>
                                    <input type="text" class="form-control-fd form-control" placeholder="¿En que empresa laboras?" name="empresa" required>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form_group">
                                    <label for="">Mensaje</label>
                                    <textarea name="mensaje" id="mensaje" class="form-control-fd form-control" placeholder="¿Cómo podemos ayudarte?" cols="30" rows="6" required></textarea>
                                </div>
                            </div>
                            <div class="col-lg-12">
                                <div class="button_box">
                                    <button class="btn-fd btn deneb_btn btn-block" type="submit">Enviar</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
       
    </div>
</section>
<?php
include('assets/includes/footer.php');
?>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.min.js"></script>
<script src="js/swals.js"></script>
<script>
    jQuery.validator.addMethod("validate_email", function(value, element) {
        if (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value)) {
            return true;
        } else {
            return false;
        }
    }, "Ingresa una dirección de correo válida.");

    $(document).ready(function () {
        $("#contacto").validate({
            errorClass: "is-invalid",
            validClass: "is-valid",
            rules: {
                name:{
                    required: true,
                    minlength: 10
                },
                email: {
                    required: true,
                    validate_email: true
                },
                phone:{
                    required: true,
                    number: true,
                    minlength: 10,
                    maxlength: 10
                },
                mensaje:{
                    required:true,
                    minlength: 20
                },
                empresa:{
                    required:true,
                   
                }
            },
            messages:{
                name:{
                    required: 'Ingresa tu nombre',
                    minlength: 'El nombre completo debe tener al menos 10 carácteres'
                },
                email: {
                    required: 'Ingresa tu correo',
                    email: 'Ingresa una dirección de correo válida.'
                },
                phone:{
                    required: 'Ingresa tu celular',
                    number: 'Solo se admiten números',
                    minlength: 'El número debe contener 10 dígitos',
                    maxlength: 'El número debe contener 10 dígitos'
                },
                mensaje:{
                    required:'Escribe un mensaje',
                    minlength: 'El mensaje debe contener al menos 20 carácteres'
                },
                empresa:{
                    required:'Ingresa la empresa a la que perteneces',
                   
                }
            },
            submitHandler: function (form) { 
                let formData = new FormData($("#contacto")[0]);

            $.ajax({
                type: "post",
                url: "api/emailContacto.php",
                data: formData,
                dataType: "json",
                processData: false,
                contentType: false,
                success: function (response) {
                    if(response.email_send == true){
                        toastSuccess.fire({ html: ' <h5 style="color: #fff; margin-top:5px">Información enviada correctamente, te responderemos en breve.</h5>' })
                    }else{
                        toastError.fire({ html: ' <h5 style="color: #fff; margin-top:5px">Ocurrió un error al enviar la información: '+response.email_msg+'.</h5>' })
                    }
                }
            });
                return false;  
            }
        });

        
    });
</script>