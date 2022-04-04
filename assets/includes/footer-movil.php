<footer style="display:none">
    <div style="display:none">
        <div class="copyright_area">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                    <p style="text-align: justify; font-size: small;">
                            Se informa que FACTOR FORTALEZA, S.A. DE C.V. es una Sociedad Financiera de Objeto Múltiple, Entidad No Regulada, que para su constitución y operación con tal carácter, no requiere de autorización de la Secretaría de Hacienda y Crédito Público, no obstante, se encuentra sujeta a la supervisión de la Comisión Nacional Bancaria y de Valores, únicamente para efectos de lo dispuesto por el artículo 56 de la Ley General de Organizaciones y Actividades Auxiliares del Crédito. <br>
                            FACTOR FORTALEZA, S.A. DE C.V. SOFOM ENR y sus filiales alertan a los usuarios para que eviten ser víctimas de fraudes cometidos por personas ajenas a la empresa con cualquier transacción y/o servicio financiero a través de la página www.sofortaleza.com FACTOR FORTALEZA, S.A. DE C.V. SOFOM ENR y sus filiales no asumen responsabilidad alguna por cualquier transacción y/o servicio financiero sin su debida representación y autorización. <br>
                            Costo Anual Total (CAT) sin IVA para fines informativos 110.10%. Fecha de cálculo 17/11/2021.
                        </p>
                    
                    </div>
                </div>
            </div>
        </div>
        <div class="container-fluid copyright_text">
            <div class="container">
                <div class="row">
                    <p>Copyright &copy; <?php echo date('Y') ?> <span>FACTOR FORTALEZA</span>. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </div>
</footer><!-- End footer -->
<!-- jquery  -->
<script src="assets/js/vendor/jquery-1.12.4.min.js"></script>

<!-- signature js -->
<script type="text/javascript" src="assets/js/jquery-ui.min.js"></script>

<script type="text/javascript" src="assets/js/jquery.signature.min.js"></script>
<script src="assets/js/jquery.ui.touch-punch.min.js"></script>

<!--modernizr js-->
<script src="assets/js/vendor/modernizr-3.6.0.min.js"></script>
<!-- Bootstrap js  -->
<script src="assets/js/vendor/bootstrap.min.js"></script>
<script src="assets/js/vendor/popper.min.js"></script>
<!-- slick fader js  -->
<script src="assets/js/vendor/slick.min.js"></script>
<!-- isotope js  -->
<script src="assets/js/vendor/isotope.min.js"></script>
<!-- imageloaded js-->
<script src="assets/js/vendor/imagesloaded.min.js"></script>
<!--sidebar js-->
<script src="assets/js/vendor/sidebar-menu.js"></script>
<!--wow js-->
<script src="assets/js/vendor/wow.min.js"></script>
<!-- custom js  -->
<script src="assets/js/custom.js"></script>
<script src="assets/js/sweetalert2.js"></script>

<!-- Datatable <script src="assets\js\datatables\jquery.dataTables.min.js"></script> -->

<script src="assets\js\datatables\datatables.min.js"></script>
<script src="assets\js\datatables\dataTables.bootstrap4.min.js"></script>


</div> 
<!-- funcion para forzar cache en css -->
<script>
    (function() {
  var h, a, f;
  a = document.getElementsByTagName('link');
  for (h = 0; h < a.length; h++) {
    f = a[h];
    if (f.title.toLowerCase().match(/refresh/) && f.href) {
      var g = f.href.replace(/(&|\?)rnd=\d+/, '');
      f.href = g + (g.match(/\?/) ? '&' : '?');
      f.href += 'rnd=' + (new Date().valueOf());
    }
  } // for
  setTimeout(() => {
    $("#loadAfterCSS").show();
    $("footer").show();
  }, 300);
 
})()
</script>