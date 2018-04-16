function addToCart(e, id){
    e.preventDefault();
    jQuery.post('/cart/add/'+id)
    .then((r)=>{
        jQuery('#cart-total').html(r.total);
    })
}

function removeFromCart(e){
    jQuery('#cart-total').html(jQuery('#cart-total').html() - 1);
}

function addnewCat(){
    $('#newcategorydiv').show()
}

function sorters(){
    jQuery.post('/admin/order/', {kind: $('#kind').val(), order: $('#order').val()})
}

$('#rinputPassword').keyup(function(e){
    if($('#inputPassword').val().length > 0 && $('#inputPassword').val() == $('#rinputPassword').val()){
        $('#float-checkpass').fadeIn()
        $('#float-checkpass1').fadeOut()
    } else {
        $('#float-checkpass').fadeOut()
        $('#float-checkpass1').fadeIn()
    }
})

$('.form-signup').submit(function(event){
    if($('#inputPassword').val() != $('#rinputPassword').val()){
        event.preventDefault();
    }
})

function printReport(print) {
    var printContents = document.getElementById(print).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
}