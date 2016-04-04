$(function() {
    $('[data-toggle="tooltip"]').tooltip();

    // Sets up the first number
    $('.tpa-display').each(function() {
        $(this).attr('data-id','a').data('tpa',new Tpa());
        displayValue($(this));
    });

    // Displays the elements of a number that depend on the next
    function displayBinary(row) {
        var tpa=row.data('tpa');
        var next=row.next('.tpa-display');
        if (next.length==0) {
            row.find(".comparitors pre").hide();
            row.find(".binary-ops").hide();
        } else {
            row.find(".comparitors pre").show();
            row.find(".binary-ops").show();
            row.find('.tpaName-next').text(next.attr('data-id'));
            var tpa2=next.data('tpa');
            if (typeof tpa2!=='undefined') {
                row.find(".comparitors pre span:not([class^='tpaName'])").each(function () {
                    this.textContent = tpa[this.getAttribute('class').substr(4)](tpa2);
                });
            }
        }
    }

    // Displays a number
    function displayValue(row) {
        var tpa=row.data('tpa');
        row.find('.tpaName-this').text(row.attr('data-id'));
        var decimaltext=row.find('.tpa-decimal');
        var dps=decimaltext.data('decimal-places');
        if (typeof dps=='undefined') decimaltext.val(tpa.toDecimal());
        else decimaltext.val(tpa.toDecimal(parseInt(dps)));
        row.find('.tpa-fraction').val(tpa.toFraction());
        row.find('.tpa-value').val(tpa.value().toExponential());
        row.find('.tpa-simplify').text('');
        row.find(".indicators pre span:not([class^='tpaName'])").each(function() {
            this.textContent=tpa[this.getAttribute('class').substr(4)]();
        });
        displayBinary(row);
        var prev=row.prev('.tpa-display');
        if (prev.length==0) row.find('.remove-tpa').hide();
        else {
            row.find('.remove-tpa').show();
            displayBinary(prev);
        }
    }

    // Set up event listeners for all actions
    $('body').on('change','textarea,input',function(event) {
        var row=$(this).parents('.tpa-display');
        row.find('.error-line').hide();
        var tpa=row.data('tpa');
        try {
            var value=$(this).val();
            if ($(this).hasClass('tpa-value')) {
                value=parseFloat(value);
                if (isNaN(value)) throw new Error("Value entry is not valid");
            }
            tpa.set(value);
            displayValue(row);
        } catch (error) {
            row.find('.error-line span').text(error.message);
            row.find('.error-line').show();
        }
    }).on('click','.simplify-button',function(event) {
        var row=$(this).parents('.tpa-display');
        row.find('.error-line').hide();
        var tpa=row.data('tpa');
        row.find('.tpa-simplify').text('='+tpa.simplify(0));
        row.find('.tpa-fraction').val(tpa.toFraction());
    }).on('click','.decimal-places',function(event) {
        var row=$(this).parents('.tpa-display');
        var decimaltext=row.find('.tpa-decimal');
        var dps=$(event.target).attr('data-dps');
        decimaltext.data('decimal-places',dps);
        row.find('.tpa-decimal-places').text(dps);
        displayValue(row);
    }).on('click','.unary-ops',function(event) {
        var row=$(this).parents('.tpa-display');
        row.find('.error-line').hide();
        var tpa=row.data('tpa');
        var func=$(event.target).attr('data-function');
        tpa[func]();
        displayValue(row);
    }).on('click','.binary-ops',function(event) {
        var row=$(this).parents('.tpa-display');
        row.find('.error-line').hide();
        var tpa=row.data('tpa');
        row.next('.tpa-display').each(function() {
            var tpa2=$(this).data('tpa');
            var func=$(event.target).attr('data-function');
            try {
                tpa[func](tpa2);
            } catch (error) {
                row.find('.error-line span').text(error.message);
                row.find('.error-line').show();
            }
        });
        displayValue(row);
    }).on('click','.remove-tpa',function(event) {
        var row=$(this).parents('.tpa-display');
        var prev=row.prev('.tpa-display');
        row.remove();
        prev.each(function() {
            displayBinary($(this));
        });
    }).on('click','.add-tpa',function(event) {
        $(this).tooltip('hide');
        var row=$(this).parents('.tpa-display');
        var tpa=row.data('tpa');
        var names='abcdefghijklmnopqrstuvwxyz';
        for (var i=0;i<names.length;i++) {
            if ($(".tpa-display[data-id='"+names[i]+"']").length==0) break;
        }
        // If we have a spare letter us it, otherwise you've had your lot!
        if (i<names.length) {
            var clone=row.clone();
            row.after(clone);
            clone.attr('data-id',names[i]);
            clone.data('tpa',new Tpa(tpa));
            displayValue(clone);
        }
    });
});

