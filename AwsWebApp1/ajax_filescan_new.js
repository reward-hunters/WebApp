(function ($) {


    // 2017-05-31 - this file is optimized by Zilvinas. Changes made at clearScene function
    // 2017-06-01 - quality improvements
    //
    //======================     

    function placeNewImage(file) {
        var reader = new FileReader();

        console.log(file);

        console.log("input file change");

        reader.addEventListener("load", function () {
            $("#upload_pane").css("background-image", 'url("' + reader.result + '")');
            $("#upload_pane").css("background-size", "contain");
            $("#upload_pane").css("background-repeat", "no-repeat");
            $("#upload_pane").css("background-position", "center");
            $("input[type='submit']").prop('disabled', false);
            $("#process_type").val('image_parse');
            //     $("input[name='process']").val("Process");

            $("#option_pane").hide();
            $("#lbl_Choose").hide();
            $("#divSmooth").hide();

            $("#upload_pane").hover(function () {
                $("#upload_pane .dragdrop").toggle();
            });
            // 			$("#upload_pane .dragdrop").hide(); 
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    }

  var composerBeckmann, firstPass = true; // Zilvinas - quality improvements #1

    var oldScene;

    function checkAngleSucess(result) {
        var session = document.getElementById("sessionID").value;
        var angle = result;
        if (angle > 10) {
            swal("Warning!", "Head is rotated more than 10 degrees. Please find another picture.", "error");
            return;
        }
        if (angle > 5)
            swal("Warning!", "Head is rotated over 5 degrees. Results may not be satisfactory.", "warning");

        $("#loading").hide();
        $(".right-section").hide();
        var imgPath = "http://printahead.net/printahead.online/PrintAhead_images/" + session + ".jpeg#" + new Date().getTime();
        $("#upload_pane").css("background-image", 'url("' + imgPath + '")');
        $("#upload_pane").css("background-size", "contain");
        $("#upload_pane").css("background-repeat", "no-repeat");
        $("#upload_pane").css("background-position", "center");

        imgPath = "http://printahead.net/printahead.online/PrintAhead_images/" + session + ".jpeg#t" + new Date().getTime();

        $("input[name='process']").val("Go");
        $("#process_type").val("build_model");

        $("#option_pane").show();
        $("#lbl_Choose").show();

        $('#btnProcess').removeClass("active");
        $('#btnProcess').addClass("disactive");
        $("#btnProcess").prop('disabled', false);
    }
    function checkAngleFailure() {
        checkAngleSucess(0);
    }

    // Файл не успел создаться на ФТП. Проверяем через какое-то время еще раз
    function SetImage_Failure(result) {
        setTimeout(function () { }, 1000);  // kjk
        var session = document.getElementById("sessionID").value;
        var ftpPath = "ftp://108.167.164.209/public_html/printahead.online/PrintAhead_images/" + session + ".jpeg";
        window.PageMethods.CheckFileExists(ftpPath, SetImage_Success, SetImage_Failure);
    }

    //Рекурсивная функция создания файла картинки на ФТП. Если создали - показываем пользователю. Если нет - пробуем проверить еще раз файл
    function SetImage_Success(result) {
        var session = document.getElementById("sessionID").value;
        if (result == "bad") {
            setTimeout(function () { }, 1000);
            window.PageMethods.CheckFileExists("ftp://108.167.164.209/public_html/printahead.online/PrintAhead_images/" + session + ".jpeg", SetImage_Success, SetImage_Failure);
        } else {
            window.PageMethods.GetFaceAngle(session, checkAngleSucess, checkAngleFailure);
        }
    }

    // сбрасываем все настройки (если вдруг решили фотку поменять)
    function ClearSelection() {
        $(".right-section").hide();

        var container = $("#model-preview");
        var renderer = new THREE.WebGLRenderer();           // clear renderer
        renderer.setSize(container.width(), container.height());
        container.html(renderer.domElement);

        document.getElementById("sessionID").value = "";
        document.getElementById("currentType").value = -1;

        document.getElementById("radioM").checked = false;
        document.getElementById("radioF").checked = false;
        document.getElementById("radioB").checked = false;
        document.getElementById("radioG").checked = false;

        $("#option_pane").hide();
        $("#lbl_Choose").hide();
        $("#divSmooth").hide();
        document.getElementById("btnMale").src = "http://printahead.net/wp-content/uploads/2017/04/btnMaleGray.png";
        document.getElementById("btnFem").src = "http://printahead.net/wp-content/uploads/2017/04/btnFemaleGray.png";
        document.getElementById("btnBoy").src = "http://printahead.net/wp-content/uploads/2017/04/btnBoyGray.png";
        document.getElementById("btnGirl").src = "http://printahead.net/wp-content/uploads/2017/04/btnGirlGray.png";

        document.getElementById("hairPath").value = "";
        document.getElementById("hairMaterialPath").value = "";

        document.getElementById("accessoriesPath").value = "";
        document.getElementById("accessoriesMaterialPath").value = "";
        document.getElementById("basePath").value = "";
        document.getElementById("baseMaterialPath").value = "";

        document.getElementById("addonPath1").value = "";
        document.getElementById("addonPath2").value = "";
        document.getElementById("addonPath3").value = "";
        document.getElementById("addonPath4").value = "";

        document.getElementById("addonMaterialPath").value = "";
        document.getElementById("workType").value = 0;

        document.getElementById("orderID").value = "";
        document.getElementById("redirectURL").value = "";
        document.getElementById("size").value = 0;

        document.getElementById("trackSmooth").value = 20;

        $("#btnRemoveAccessory").prop('disabled', true);
    }

    function CropImageSuccess(result) {
        ClearSelection();
        document.getElementById("sessionID").value = result;

        setTimeout(function () { }, 1000);

        window.PageMethods.CheckFileExists("ftp://108.167.164.209/public_html/printahead.online/PrintAhead_images/" + result + ".jpeg", SetImage_Success, SetImage_Failure);
    }

    function CropImageFailure(r) {
        $("#detector").html("! Error ! <br>" + r);
        $("#detector").css('background', "");
        $("#loading").hide();
        $(".right-section").hide();

        $('#btnProcess').removeClass("active");
        $('#btnProcess').addClass("disactive");
        $("#btnProcess").prop('disabled', false);

        // alert error
    }
    function LoadImage(path, sessionID) {
        $(".right-section").show();
        $("#loading").show();
        $("#loading #complete").html("Waiting for Server process ... <br> (May take 1-2 Minutes)");

        window.PageMethods.CropImage(path, CropImageSuccess, CropImageFailure);
        return sessionID;
    }

    function LoadModelSuccess(result) {
        var session = document.getElementById("sessionID").value;
        var redirectURL = document.getElementById("redirectURL").value;
        if (redirectURL === "") // if we pressed ADD to cart - passed to checkout
        {
            $('#btnUpdateAccessory').removeClass("active");
            $('#btnUpdateAccessory').addClass("disactive");
            $("#btnUpdateAccessory").prop('disabled', false);

            $('#btnProcess').removeClass("active");
            $('#btnProcess').addClass("disactive");
            $("#btnProcess").prop('disabled', false);

       //     $("#divSmooth").show();

            Load_Model(session);
        } else {
            var productID = document.getElementById("orderID").value;
            open_new_page(redirectURL + "?add-to-cart=" + productID);
        }
    }
    function LoadModelFailure(r) {
        alert("Load model failure :(" + r);
    }
    function Abalone_LoadModel() {
        $("#loading").show();
        $("#loading #complete").html("Waiting for Server process ...  <br> (May take 1-2 Minutes)");

        var session = document.getElementById("sessionID").value;
        var type = document.getElementById("currentType").value;
        var hairPath = document.getElementById("hairPath").value;
        var hairMaterialPath = document.getElementById("hairMaterialPath").value;

        var accessoriesPath = document.getElementById("accessoriesPath").value;
        var accessoriesMaterialPath = document.getElementById("accessoriesMaterialPath").value;
        var basePath = document.getElementById("basePath").value;
        var baseMaterialPath = document.getElementById("baseMaterialPath").value;

        var addonPath1 = document.getElementById("addonPath1").value;
        var addonPath2 = document.getElementById("addonPath2").value;
        var addonPath3 = document.getElementById("addonPath3").value;
        var addonPath4 = document.getElementById("addonPath4").value;
        var addonMaterialPath = document.getElementById("addonMaterialPath").value;

        var smooth = document.getElementById("trackSmooth").value;

        var size = -1;
        var redirectURL = document.getElementById("redirectURL").value;
        if (redirectURL !== "")
            size = document.getElementById("size").value;

        var productID = document.getElementById("orderID").value;
        window.PageMethods.LoadModel(type, session, hairPath, hairMaterialPath, accessoriesPath, accessoriesMaterialPath, basePath, baseMaterialPath, addonPath1, addonPath2, addonPath3, addonPath4, addonMaterialPath, 20, 0, smooth, size, productID, LoadModelSuccess, LoadModelFailure);
    }



    jQuery("#btnMale").click(function () {
        document.getElementById("currentType").value = 0;
    });
    jQuery("#btnFem").click(function () {
        document.getElementById("currentType").value = 1;

    });
    jQuery("#btnBoy").click(function () {
        document.getElementById("currentType").value = 2;
    });
    jQuery("#btnGirl").click(function () {
        document.getElementById("currentType").value = 3;
    });

   


    jQuery("#optionsRadios1").click(function () {
        document.getElementById("size").value = 0;
    });
    jQuery("#optionsRadios2").click(function () {
        document.getElementById("size").value = 1;
    });
    jQuery("#optionsRadios3").click(function () {
        document.getElementById("size").value = 2;
    });

    jQuery("#btnUpdateAccessory").click(function () {
        $('#btnUpdateAccessory').removeClass("disactive");
        $('#btnUpdateAccessory').addClass("active");
        $("#btnUpdateAccessory").prop('disabled', true);
        Abalone_LoadModel();
    });

    jQuery("#btnRemoveAccessory").click(function () {
        if ($(".base .img-item").hasClass("active")) {
            $(".base .img-item").removeClass("active");
            $(".accessory-color .img-item").removeClass("active");

            accessory_addon_price -= 6;
            if (accessory_addon_price === 0)
                $(".price-accessory-addon").hide();

            document.getElementById("workType").value = 0;
            document.getElementById("basePath").value = "";
            document.getElementById("baseMaterialPath").value = "";

            calculate_price();
        }
        else if ($(".accessory-add-on .img-item").hasClass("active")) {
            $(".accessory-add-on .img-item").removeClass("active");
            $(".accessory-color .img-item").removeClass("active");

            --addonsCount;
            accessory_addon_price -= 6;
            if (accessory_addon_price === 0)
                $(".price-accessory-addon").hide();

            document.getElementById("workType").value = 0;
            document.getElementById("addonPath1").value = "";
            document.getElementById("addonMaterialPath").value = "";

            calculate_price();
        }

        $('#btnRemoveAccessory').addClass("active");
        $("#btnRemoveAccessory").prop('disabled', true);

    });
    var lastAddon;

    function clearScene(scene) {
        if (scene == null)
            return;

        for (var i = scene.children.length - 1; i >= 0; i--) {
            var obj = scene.children[i];
            scene.remove(obj);


            // changes by Zilvinas          // A lot of mistakes made Zilvinas and run away. Don't trust him.
            if (obj.hasOwnProperty('children')) {
                for (var y in obj.children) {

                    if (obj.children[y].material != null) {
                        if (obj.children[y].material.map != null)
                            obj.children[y].material.map.dispose();
                        obj.children[y].material.dispose();
                        obj.children[y].material = null;
                    }

                    if (obj.children[y].geometry != null) {
                        obj.children[y].geometry.dispose();
                        obj.children[y].geometry = null;
                    }
                    obj.children[y] = null;
                }
            }
            // end of changes by Zilvinas

        }
    }

    //====================

    function open_new_page(url) {
        window.location = url;
    }

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    var price_table = {
        'Basic Figure': 'base-figure-value',
        'Hair Premium': 'hair-premium-value',
        'Accessory Premium': 'accessory-premium-value',
        'Accessory Add on': 'accessory-addon-value',
        'Shipping': 'shipping-value',
        'TOTAL': 'total-value'
    }

    $("#setting_pane").hide();
    $(".right-section").hide();
    $("input[type='submit']").prop('disabled', true);

    $(".price-hair").hide();
    $(".price-accessory").hide();
    $(".price-accessory-addon").hide();

    var total_price = 0,
        figure_price = 0,
        shipping_price = 6,
        hair_price = 0,
        accessory_price = 0,
        accessory_addon_price = 0;

    var addonsCount = 0;

    function calculate_price() {
        $("#base-figure-value").text('$' + figure_price);
        $("#hair-premium-value").text('$' + hair_price);
        $("#accessory-premium-value").text('$' + accessory_price);
        $("#accessory-addon-value").text('$' + accessory_addon_price);
        $("#shipping-value").text('$' + shipping_price);
        total_price = shipping_price + hair_price + accessory_addon_price + accessory_price + figure_price;
        $("#total-value").text("$" + total_price);
    }

    $(document).on('submit', 'form#form', function () {
        var formData = new FormData($("#form")[0]);
        formData.append('action', 'trynowactions');
        $.ajax({
            url: target_url.ajax_url,
            type: "post",
            data: formData,
            success: function (data) {
                console.log(data);
                var r = JSON.parse(data);
                console.log(r);
                if (r.status == "error") {
                    alert(r.data);
                    return;
                }
                if (r.type == "image_parse") {
                    $('#btnProcess').removeClass("disactive");
                    $('#btnProcess').addClass("active");
                    $("#btnProcess").prop('disabled', true);

                    LoadImage(r["uploaded_url"]);           // эта функция сама все выставит и настроит. 
                } else if (r.type == 'build_model') {
                    var type = document.getElementById("currentType").value;
                    if (type === "-1") {
                        swal("Warning!", "Please select gender..", "warning");
                        return;
                    }

                    $('#btnProcess').removeClass("disactive");
                    $('#btnProcess').addClass("active");
                    $("#btnProcess").prop('disabled', true);

                    console.log("build model");
                    Abalone_LoadModel();

                    console.log("Calculate price");

                    $(".right-section").show();
                    $("input[name='sizeoptionsRadios']").change(function () {
                        figure_price = Number($(this).val());
                        calculate_price();
                    });
                    figure_price = Number($("input[name='sizeoptionsRadios']").val());
                    calculate_price();

                    $("#add_to_cart").click(function () {
                        var session = document.getElementById("sessionID").value;
                        var price = clone(price_table);
                        var k, data = {};
                        for (k in price) {
                            price[k] = Number($("#" + price[k]).text().substr(1));
                        }
                        data.action = 'addtocart';
                        data.price = price;
                        data.sesID = session;
                        data.qty = $("#quantity").val();
                        $.ajax({
                            url: target_url.ajax_url,
                            type: "post",
                            data: data,
                            //    data: { action: "addtocart" },
                            success: function (r)//we got the response
                            {
                                var result = JSON.parse(r);
                                console.log(result);
                                if (result.status == 'success') {
                                    // 											$("body").trigger("updated_checkout");
                                    document.getElementById("orderID").value = result.product_id;
                                    document.getElementById("redirectURL").value = result.redirect_url;
                                    Abalone_LoadModel();

                                    //  open_new_page(result.redirect_url);
                                }
                            },
                            error: function (exception) { alert('Exeption:' + exception); }
                        });
                    });
                }
            },
            error: function (xhr, err) {
                alert('Error');
            },
            cache: false,
            contentType: false,
            processData: false
        });
        return false;
    });

    $("#upload_pane > input").change(function () {
        var file = this.files[0];
        placeNewImage(file);
    });

    $("#option_pane img").click(function () {
        $("#option_pane img").each(function () {
            this.src = $(this).attr("data-normal");
        });
        this.src = $(this).attr("data-hover");
    });

    $(".model-option").click(function () {
        $(this).addClass("active");
        $(this).siblings().removeClass("active");
        switch ($(this).attr("data-choice")) {
            case "1":
                $("#setting_pane").hide();
                $("#image_pane").show();
                $("#process_type").val('image_parse');
                //     $("input[name='process']").val("Process");
                break;
            case "2":
                $("#setting_pane").show();
                $("#image_pane").hide();
                break;
        }
    });

    $("#options-menu button").click(function () {
        $("#options-menu .btn").removeClass("active");
        $(this).addClass("active");
        if (this.innerText === "Accessory")
            $("#divRemove").show();
        else $("#divRemove").hide();

        $("#" + $(this).attr("data-option")).siblings().removeClass("active");
        $("#" + $(this).attr("data-option")).addClass("active");
    });

    $("#select_photo").click(function () {
        ClearSelection();
        $("input[type='file']").click();
        return false;
    })

    $.post(
        target_url.ajax_url,
        { 'action': 'fetchsettingfiles' },
        function (r) {
            var data = JSON.parse(r), t;
            console.log(data);
            var div_head = ' \
					<div class="group-option"> \
						<h4> SECTION_HEADING</h4> \
							<div class="img-listCLASS GROUP DGROUP clearfix"> ',
                div_content = '\
						<div class="img-item"> \
							<img src="IMGSRC"> \
						</div>',
                div_end = ' </div> </div>',
                a, b, i;
            var node = '', keyorder;
            keyorder = Object.keys(data.Hair).reverse();
            for (i = 0; i < keyorder.length; i++) {
                a = keyorder[i];
                t = a;
                if (t === "Materials")
                    continue;
                node = node + div_head.replace("SECTION_HEADING", t);
                if (t === "Icons") {
                    t = "Color";
                    node = node.replace("GROUP", "hair-color");
                }
                else {
                    node = node.replace("GROUP", "hair");
                    t = t + " Hair";
                }

                if (t === "Icons")
                    node = node.replace("DGROUP", "Materials");
                else
                    node = node.replace("DGROUP", t);

                t = 0;
                for (b in data.Hair[a]) {
                    node = node + div_content.replace("IMGSRC", data.Hair[a][b]);
                    t++;
                }
                if (t > 5) node = node.replace("CLASS", "");
                else node = node.replace("CLASS", "0");
                node = node + div_end;
            }
            node = node.replace("<h4> Icons</h4>", "<h4> Materials</h4>");
            $("#option-hair").html(node);

            node = '';
            keyorder = Object.keys(data.Accessory).reverse();
            for (i = 0; i < keyorder.length; i++) {
                a = keyorder[i];
                t = a;
                if (t === "Materials")
                    continue;
                node = node + div_head.replace("SECTION_HEADING", t);
                if (t === "Icons")
                    node = node.replace("GROUP", "accessory-color");
                else if (t === "Add-on")
                    node = node.replace("GROUP", "accessory-add-on");
                else if (t === "Base")
                    node = node.replace("GROUP", "base");
                else 
                    node = node.replace("GROUP", "accessory");

                if (t==="Icons")
                    node = node.replace("DGROUP", "Materials");
                else
                    node = node.replace("DGROUP", t);

                t = 0;
                for (b in data.Accessory[a]) {
                    node = node + div_content.replace("IMGSRC", data.Accessory[a][b]);
                    t++;
                }
                if (t > 5) node = node.replace("CLASS", "");
                else node = node.replace("CLASS", "0");
                node = node + div_end;
            }
            node = node.replace("<h4> Icons</h4>", "<h4> Materials</h4>");
            $("#option-accessory").html(node);

            console.log(node);

            attach_event_handler();
        }
    )



    function attach_event_handler() {
        $(".hair .img-item").click(function () {
            $(".hair .img-item").removeClass("active");
            $(this).addClass("active");
            if ($(this).parent().hasClass("Premium")) {
                $(".price-hair").show();
                hair_price = 6;
            }
            else {
                $(".price-hair").hide();
                hair_price = 0;
            }

            console.log("Load hair");
            $(".accessory-add-on .img-item").removeClass("active");

            document.getElementById("hairPath").value = this.innerHTML;
            calculate_price();
        });
        $(".hair-color .img-item").click(function () {
            $(".hair-color .img-item").removeClass("active");
            $(this).addClass("active");

            console.log("Load hair material");
            document.getElementById("hairMaterialPath").value = this.innerHTML;
        });

        $(".accessory .img-item").click(function () {
            $('#btnRemoveAccessory').addClass("active");
            $("#btnRemoveAccessory").prop('disabled', true);

            $(".accessory .img-item").removeClass("active");
            $(this).addClass("active");
            if ($(this).parent().hasClass("Premium")) {
                $(".price-accessory").show();
                accessory_price = 6;
            }
            else {
                $(".price-accessory").hide();
                accessory_price = 0;
            }

            console.log("Load accessory");

            $(".base .img-item").removeClass("active");
            $(".accessory-add-on .img-item").removeClass("active");
            $(".accessory-color .img-item").removeClass("active");

            document.getElementById("workType").value = 0;
            document.getElementById("accessoriesPath").value = this.innerHTML;

            calculate_price();
        });

        $(".base .img-item").click(function () {
            $('#btnRemoveAccessory').removeClass("active");
            $("#btnRemoveAccessory").prop('disabled', false);

            if ($(this).hasClass("active"))
                return;

            if (document.getElementById("basePath").value === "")
               accessory_addon_price += 6;

            $(".base .img-item").removeClass("active");
            $(this).addClass("active");

            console.log("Attach base");
 

            $(".price-accessory-addon").show();
            document.getElementById("workType").value = 1;

            $(".accessory .img-item").removeClass("active");
            $(".accessory-add-on .img-item").removeClass("active");
            $(".accessory-color .img-item").removeClass("active");

            document.getElementById("basePath").value = this.innerHTML;
            calculate_price();
        });

        $(".accessory-color .img-item").click(function () {
            $('#btnRemoveAccessory').addClass("active");
            $("#btnRemoveAccessory").prop('disabled', true);

            $(".accessory-color .img-item").removeClass("active");
            $(this).addClass("active");

            console.log("Load accessory material");

            if (document.getElementById("workType").value === "0")
                document.getElementById("accessoriesMaterialPath").value = this.innerHTML;
            else if (document.getElementById("workType").value === "1")
                document.getElementById("baseMaterialPath").value = this.innerHTML;
            else
                document.getElementById("addonMaterialPath").value = this.innerHTML;
        });
        $(".accessory-add-on .img-item").click(function () {
            $('#btnRemoveAccessory').removeClass("active");
            $("#btnRemoveAccessory").prop('disabled', false);
            lastAddon = this;
            if ($(this).hasClass("active")) {           // remove addon
                return;
            }

            if (document.getElementById("addonPath1").value === "")
                accessory_addon_price += 6;

            $(".accessory-add-on .img-item").removeClass("active");
            console.log("Attach addon");
            $(this).addClass("active");
            ++addonsCount;

                $(".price-accessory-addon").show();
                document.getElementById("workType").value = 2;
                $(".accessory .img-item").removeClass("active");
                $(".base .img-item").removeClass("active");
                $(".accessory-color .img-item").removeClass("active");
       
                document.getElementById("addonPath1").value = this.innerHTML;

            calculate_price();

        });
    }

    function Load_Model(sessionID) {
        var container = $("#model-preview");
        container.crossOrigin = "anonymous";
        var scene = new THREE.Scene();
        scene.crossOrigin = "anonymous";
        scene.background = new THREE.Color(0xf2f2f2);

        clearScene(oldScene);
        oldScene = scene;

        var camera = new THREE.OrthographicCamera(container.width() / -2, container.width() / 2, container.height() / 2, container.height() / -2, 1, 10000);
        //var renderer = new THREE.WebGLRenderer();
        var renderer = new THREE.WebGLRenderer({ antialias: true }); // Zilvinas, Quality - { antialias: true }
        renderer.preserveDrawingBuffer = true;
        renderer.crossOrigin = "anonymous";

        /* zilvinas, quality - new renderer */
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.renderReverseSided = false;
        renderer.autoClear = false;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.autoClear = false;

        // BECKMANN
        var effectBeckmann = new THREE.ShaderPass(THREE.ShaderSkin["beckmann"]);
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        effectCopy.renderToScreen = true;
        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
        var rtwidth = 512, rtheight = 512;
        composerBeckmann = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(rtwidth, rtheight, pars));
        composerBeckmann.addPass(effectBeckmann);
        composerBeckmann.addPass(effectCopy);
        /* end of zilvinas, quality - new renderer */

        var objurl = 'https://printahead.net/printahead.online/PrintAhead_models/' + sessionID + '/';

        renderer.setSize(container.width(), container.height());
        container.html(renderer.domElement);
        // changed by Zilvinas - 3 lines below were not used at all, so just commented those out
        //var geometry = new THREE.BoxGeometry(70, 70, 70, 10, 10, 10);
        //var material = new THREE.MeshBasicMaterial({ color: 0xfffff, wireframe: true });
        //var cube = new THREE.Mesh(geometry, material);

        // scene.add(cube);

        camera.position.z = 40;
        camera.zoom = 4;


        var controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.reset();

        var ambient = new THREE.AmbientLight(0x444444);
        // ambient.position.set(0, 0, 1).normalize(); 
        scene.add(ambient);

        //var directionalLight = new THREE.DirectionalLight(0x555555);
        //directionalLight.position.set(5, 5, 5);
        //directionalLight.target.position.set(0, 0, 0);
        //scene.add(directionalLight);
        //
        //var directionalLight1 = new THREE.DirectionalLight(0x555555);
        //directionalLight1.position.set(0, 0, 10).normalize();
        //scene.add(directionalLight1);
        //
        //var directionalLight2 = new THREE.DirectionalLight(0x555555);
        //directionalLight2.position.set(-5, 5, 5).normalize();
        //scene.add(directionalLight2);

        /* zilvinas, quality - new lights */
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(500, 0, 500);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 200;
        directionalLight.shadow.camera.far = 1500;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        directionalLight.shadow.bias = -0.005;
        scene.add(directionalLight);

        var target0 = [];

        console.log(controls);

        $("#model-control > .button").click(function () {
            $(this).siblings().removeClass("active");
            $(this).addClass("active");
            controls.customControl(1, -1);
        });

        $("#model-control > .zoomin").click(function () {
            controls.zoomIn();
        });

        $("#model-control > .zoomout").click(function () {
            controls.zoomOut();
        });

        $("#model-control > .hand").click(function () {
            controls.customControl(1, 2);
        });

        $("#model-control > .unscale").click(function () {
            // 			controls.customControl(1, 2); 
            camera.position.z = 40;
            controls.reset();
            controls.target.set(target0[0], target0[1], target0[2]);
        });

        $("#model-control > .rotate").click(function () {
            controls.customControl(1, 0);
        });

        var onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete, 2) + '% downloaded');
                $("#loading #complete").html(Math.round(percentComplete, 2) + '% downloaded');
            }
        };
        var onError = function (xhr) {
            console.log("ERROR OCCUARED", xhr);
        };

        THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.crossOrigin = "anonymous";
        mtlLoader.setPath(objurl);
        mtlLoader.load(sessionID + '.mtl', function (materials) {
            materials.preload();
            console.log(materials);
            var objLoader = new THREE.OBJLoader();
            objLoader.crossOrigin = "anonymous";
            objLoader.setMaterials(materials);
            objLoader.setPath(objurl);
            objLoader.load(sessionID + '.obj', function (object) {


                var x, y, z, minx, miny, minz, maxx, maxy, maxz;
                minx = miny = minz = Infinity;
                maxx = maxy = maxz = -Infinity;
                x = y = z = 0.0;
                var i = 0;

                object.traverse(function (child) {

                    if (child.geometry !== undefined) {
                        i++;

                        var cx = new THREE.Vector3();

                        child.geometry.computeBoundingBox();
                        cx.x = (child.geometry.boundingBox.max.x + child.geometry.boundingBox.min.x) / 2;
                        cx.y = (child.geometry.boundingBox.max.y + child.geometry.boundingBox.min.y) / 2;
                        cx.z = (child.geometry.boundingBox.max.z + child.geometry.boundingBox.min.z) / 2;

                        x += cx.x;
                        y += cx.y;
                        z += cx.z;

                        if (minx > cx.x) minx = cx.x;
                        if (miny > cx.y) miny = cx.y;
                        if (minz > cx.z) minz = cx.z;

                        if (maxx < cx.x) maxx = cx.x;
                        if (maxy < cx.y) maxy = cx.y;
                        if (maxz < cx.z) maxz = cx.z;

                    }

                });

                x /= i;
                y /= i;
                z /= i;
                object.position.x -= x;
                object.position.y -= y;
                object.position.z += -minz - maxz - (maxx - minx + maxy - miny);

                controls.target.set(x, y, -minz - maxz - (maxx - minx + maxy - miny));

                target0 = [x, y, -minz - maxz - (maxx - minx + maxy - miny)];

                console.log(camera);
                old_model = sessionID;
                console.log(scene);

                scene.add(object);
                $("#loading").hide();

                render();

            }, onProgress, onError);
        }, onProgress, onError);


        var screenshot = renderer.domElement.toDataURL("image/png", "Screenshot");


        console.log("HERE");

        function render() {
            requestAnimationFrame(render);

            /* zilvinas, quality improvement - start */
            if (firstPass) {
                composerBeckmann.render();
                firstPass = false;
            }

            renderer.clear();
            /* zilvinas, quality improvement - end */

            renderer.render(scene, camera);
            //cube.rotation.x += 0.01; // changed by Zilvinas - your scene does not have cube object, so this only throws errors while rendering
            //cube.rotation.y += 0.01;
        }

    }

}(jQuery));

/*
 Documentation:
 Page consists of three parts Image pane, Setting Pane and Right Pane (including price pane)
 Image pane uploads impage in form of file onto server, server parses and returnes parsed image (in form of url) back.
 (refer to functions.php ajax calls)
 And once user confirms the parsed image and requires for 3d model.
 Then user presented with setting and choose another image options.
 settings for 3d model has been fetched from server directory /printahead.online/Library
 Pricing calculate has been done in manual way. when user selects different figure base, choosing different settings.
 each Premium adds $8, accessory addon adds $4 and shipping tax is always $6.
 */
