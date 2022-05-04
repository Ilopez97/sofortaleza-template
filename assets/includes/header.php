<?php

function active($currect_page)
{
    $url_array =  explode('/', $_SERVER['REQUEST_URI']);
    $url = end($url_array);
    if ($currect_page == $url) {
        echo 'active'; //class name in css
    }
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!-- All Meta -->

    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta http-equiv="Expires" content="0">

    <meta http-equiv="Last-Modified" content="0">

    <meta http-equiv="Cache-Control" content="no-cache, mustrevalidate">

    <meta http-equiv="Pragma" content="no-cache">
    <!-- page title -->
    <title>Sofortaleza</title>
    <!-- Favicon Icon -->
    <link rel="shortcut icon" href="assets/images/favicon.png" type="image/png">
    <!-- All css -->
    <!--Bootstrap css-->
    <link rel="stylesheet" href="assets/css/bootstrap.min.css">
    <!-- Fontawesome css -->
    <link rel="stylesheet" href="assets/fonts/fontawesome/css/all.css">
    <!-- slick fader css -->
    <link rel="stylesheet" href="assets/css/slick.css">
    <link rel="stylesheet" href="assets/css/slick-theme.css">
    <!-- sidebar-menu -->
    <link rel="stylesheet" href="assets/css/sidebar-menu.css">
    <!--animate css-->
    <link rel="stylesheet" href="assets/css/animate.css">

    <!--Style New Design-->
    <link title="refresh" rel="stylesheet" href="assets/css/style-fd.css">
    <link rel="stylesheet" href="assets/js/datatables/datatables.min.css">
    <link rel="stylesheet" href="assets/js/datatables/dataTables.bootstrap4.css">
    <link rel="stylesheet" href="assets/css/sweetalert2.css">
</head>

<body>
    <div id="loadAfterCSS" style="display:none">
        <!-- Preloader -->
        <div class="preloader">
            <div class="lds-ripple">
                <div></div>
                <div></div>
            </div>
        </div>
        <!-- Start header_area -->
        <header class="header_area header_v1 transparent_header header-fd">
            <div class="container-fluid">
                <nav class="navbar navbar-expand-lg navbar-light">
                    <div class="container-fluid container-nav-responsisve-fd">

                        <a class="navbar-brand" href="index.php#"><img src="assets\images\sofortaleza.png"
                                class="img-fluid img-logo-fd" alt=""></a>

                        <button class="navbar-toggler btn-navbar-fd" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                            <img src="assets/icons/menu-icon.svg" alt="menu-icon">
                        </button>
                        <div class="collapse navbar-collapse navbar-fd" id="navbarSupportedContent">
                            <ul class="navbar-nav mb-2 mb-lg-0" style="margin-left:5%; font-weight:bold">
                                <li class="nav-item">
                                    <a class="a-menu nav-link ad" href="#about">Acerca de</a>
                                </li>
                                <li class="nav-item">
                                    <a class="a-menu nav-link pd" href="#productos">Productos</a>
                                </li>
                                <li class="nav-item">
                                    <a class="a-menu nav-link <?php active('solicitalo-ahora.php') ?>"
                                        href="solicitalo-ahora.php">Solicitalo ahora</a>
                                </li>
                                <li class="nav-item">
                                    <a class="a-menu nav-link <?php active('asociados.php') ?>"
                                        href="asociados.php">Asociados</a>
                                </li>
                                <li class="nav-item">
                                    <a class="a-menu nav-link <?php active('para-empresas.php') ?>"
                                        href="para-empresas.php">Para Empresas</a>
                                </li>
                                <li class="nav-item">
                                    <a class="a-menu nav-link <?php active('contacto.php') ?>"
                                        href="contacto.php">Contacto</a>
                                </li>



                            </ul>
                        </div>
                        <div class="collapse navbar-collapse container-rs-fd">
                            <ul class="navbar-nav mb-2 mb-lg-0">
                                <li class="nav-item">
                                    <a href="https://facebook.com/Sofortaleza-105451558762584/" target="_blank"
                                        class="link-rs-header-fd">
                                        <img src="assets/icons/icon-facebook-sofortaleza.svg" alt="Facebook"
                                            class="icon-rs-header-fd" />
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="https://instagram.com/sofortaleza.parati" target="_blank"
                                        class="link-rs-header-fd">
                                        <img src="assets/icons/icon-instagram-sofortaleza.svg" alt="Instagram"
                                            class="icon-rs-header-fd" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </header><!-- End header_area -->