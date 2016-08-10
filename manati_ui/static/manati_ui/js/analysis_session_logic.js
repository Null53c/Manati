/**
 * Created by raulbeniteznetto on 8/10/16.
 */
var _dt;
var _countID =1;
var _attributes_db
function AnalysisSessionLogic(attributes_db){
    /************************************************************
                            GLOBAL ATTRIBUTES
     *************************************************************/


    var stepped = 0;
    var rowCount, firstError, errorCount = 0;
    var _keys = [];
    var _filename;
    var _db;
    var db_name = 'weblogs_db';
    var thiz = this;
    var _verdicts_weight = {
        "malicious":2,
        "legitimate":0,
        "suspicious":1,
        "false_positive":3,
        "undefined": -1
    };
    var _verdicts = ["malicious","legitimate","suspicious","false_positive", "undefined"];
    var myDjangoList = ((attributes_db).replace(/&(l|g|quo)t;/g, function(a,b){
        return {
            l   : '<',
            g   : '>',
            quo : '"'
        }[b];
    }));

    myDjangoList = myDjangoList.replace(/u'/g, '\'');
    myDjangoList = myDjangoList.replace(/'/g, '\"');
    _attributes_db = JSON.parse( myDjangoList );

     /************************************************************
                            PRIVATE FUNCTIONS
     *************************************************************/
     function addWeblog(weblog) {
/**
          var todo = {

            _id: new Date().toISOString(),
            title: text,
            completed: false
          };
          weblog['_id'] =  _countID; //new Date().toISOString()
 */
          _db.put(weblog, function callback(err, result) {
            if (!err) {
              console.log('Successfully save a weblog!');
            }else{
                console.log('ERROR saving');
                console.log(err);
            }
          });
          //  _countID++;
     };
    function updateWeblog(weblog){
        _db.put(weblog, function callback(err, result) {
        if (!err) {
          console.log('Successfully updated a weblog!');
        }else{
            console.log('ERROR updating');
            console.log(err);
        }
      });

    }
    function showAllWeblogs() {
      _db.allDocs({include_docs: true, descending: true}, function(err, doc) {
        for(var i = 0 ; i < doc.rows.length ; i++){
            console.log(doc.rows[i]);
        }
      });
    }
    function completeFn(results,file){
        if (results && results.errors)
        {
            if (results.errors)
            {
                errorCount = results.errors.length;
                firstError = results.errors[0];
            }
            if (results.data && results.data.length > 0)
                rowCount = results.data.length;
        }
    }

    function addRowThread(data){
        var data = data;
        data.add('undefined');
        data.add(_countID.toString());
        _countID++;
        if(data.length !== _attributes_db.length) {
            console.log(data);
        }
        else{
            _dt.row.add(data).draw(false);
            /**
            var weblog = {};
            for(var i_attr = 0; i_attr < _attributes_db.length; i_attr++ ){
                var attr = _attributes_db[i_attr];
                weblog[attr] = data[i_attr];
            }
            addWeblog(weblog)
             */
        }

    }
    function stepFn(results, parser)
    {
        stepped++;
        if (results)
        {
            if (results.data){
                rowCount += results.data.length;
                var data = results.data[0];
                if(stepped > 1){
                    Concurrent.Thread.create(addRowThread,data);
                }else{
                    var columns = [];
                    for(var i = 0; i< _attributes_db.length ; i++){
                        columns.add({title: _attributes_db[i]});
                    }
                    _keys = _attributes_db;
                    _dt = $('#weblogs-datatable').DataTable({
                        responsive: true,
                        columns: columns,
                        "scrollX": true,
                        dom: 'Bfrtip',
                        colReorder: true,
                        buttons: ['copy', 'csv', 'excel','colvis'],
                        responsive: true,
                        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
            //                var arraycontainsturtles = (myarr.indexOf("turtles") > -1);
                            $('td', nRow).addClass(aData[11]);
                            /**
                            else if ( aData[2] == "4" )
                            {
                                $('td', nRow).css('background-color', 'Orange');
                            }
                             */
                        }
                    });
                    _dt.buttons().container().appendTo( '#weblogs-datatable_wrapper .col-sm-6:eq(0)' );
                    $('#weblogs-datatable tbody').on( 'click', 'tr', function () {
                        $(this).toggleClass('selected');
                        $('.contextMenuPlugin').remove();
                    } );

                    /**
                    $('#weblogs-datatable tbody').on( 'mouseenter', 'td', function () {
                        var colIdx = _dt.cell(this).index().column;
                        $( _dt.cells().nodes() ).removeClass( 'highlight' );
                        $( _dt.column( colIdx ).nodes() ).addClass( 'highlight' );
                    } );
                     */
                    $('#panel-datatable').show();
                }

            }

            if (results.errors)
            {
                errorCount += results.errors.length;
                firstError = firstError || results.errors[0];
            }
        }
    }
    function markVerdict(verdict) {
        _dt.rows('.selected').every( function () {
            var d = this.data();
            var size_d = d.length;
            /**
            var new_w = _verdicts_weight[verdict];
            var old_w = _verdicts_weight[d[size_d - 2]];
            if(new_w >= old_w){
            */
            var old_verdict = d[size_d - 2];
               d[size_d - 2]= verdict; // update data source for the row
            /**
                    var weblog = {};
                    for(var i_attr = 0; i_attr < _attributes_db.length; i_attr++ ){
                        var attr = _attributes_db[i_attr];
                        if(attr === 'verdict'){
                            weblog[attr] = verdict;
                        }else {
                            weblog[attr] = d[i_attr];
                        }

                    }
                    updateWeblog(weblog);
            **/
                this.invalidate(); // invalidate the data DataTables has cached for this row
            /**
            }else{
                alert("You cannot assign a verdict lower than the previous one Ex: False Positive > Legitimate");
            }
             **/

        } );
        // Draw once all updates are done
        _dt.draw(false);
        _dt.rows('.selected').nodes().to$().find('td').removeClass().addClass(verdict);
        _dt.rows('.selected').nodes().to$().removeClass('selected');

    }
    /************************************************************
                            PUBLIC FUNCTIONS
     *************************************************************/
    //INITIAL function , like a contructor
    thiz.init = function(){
        $(document).ready(function() {

            $('#panel-datatable').hide();
            $('#save-table').hide();
            $('#upload').click(function (){
                 $('input[type=file]').parse({
                    config: {
                        delimiter: ',',
                        complete: completeFn,
                        step: stepFn
                        // base config to use for each file
                    },
                    before: function(file, inputElem)
                    {
                        /**
                        if(_db == undefined || _db == null) {
                            _db =  new PouchDB(db_name);
                        }
                        else{
                            _db.destroy().then(function () {
                              _db =  new PouchDB(db_name);
                            }).catch(function (err) { // error occurred
                                })
                        }
                         **/
                        _filename = file.name;
                        console.log("Parsing file...", file);
                        $("#weblogfile-name").html(file.name)
                    },
                    error: function(err, file, inputElem, reason)
                    {
                        console.log("ERROR:", err, file);
                    },
                    complete: function()
                    {
                        console.log("Done with all files");
                        $('#save-table').show();


                    }
                });
            });
            $(':file').on('fileselect', function(event, numFiles, label) {

                  var input = $(this).parents('.input-group').find(':text'),
                      log = numFiles > 1 ? numFiles + ' files selected' : label;

                  if( input.length ) {
                      input.val(log);
                  } else {
                      if( log ) alert(log);
                  }

              });
            $(document).on('change', ':file', function() {
                var input = $(this),
                    numFiles = input.get(0).files ? input.get(0).files.length : 1,
                    label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
                input.trigger('fileselect', [numFiles, label]);
            });
            $('.btn.verdict').click( function () {
                var verdict = $(this).data('verdict');
                markVerdict(verdict);
            } );
            $('#unselect').on('click', function (){
                _dt.rows('.selected').nodes().to$().removeClass('selected');
            });
            $('#weblogs-datatable').contextPopup({
                  title: 'Mark Verdict',
                  items: [
                      {label: _verdicts[0], action: function (ev) {markVerdict(_verdicts[0])}},
                      {label: _verdicts[1], action: function (ev) {markVerdict(_verdicts[1])}},
                      {label: _verdicts[2], action: function (ev) {markVerdict(_verdicts[2])}},
                      {label: _verdicts[3], action: function (ev) {markVerdict(_verdicts[3])}},
                      {label: _verdicts[4], action: function (ev) {markVerdict(_verdicts[4])}}
                  ]
            });
            /**
            $('#save-table').click( function () {
                var data = {    'filename': _filename, 'keys': _keys,
                                'csrfmiddlewaretoken': '{{ csrf_token }}',
                                'data[]': _dt.rows().data() };
                $.ajax({
                    type:"POST",
                    data: data,
                    dataType: "json",
                    url: "/manati_ui/analysis_session/create",
                    // handle a successful response
                    success : function(json) {
                        $('#post-text').val(''); // remove the value from the input
                        console.log(json); // log the returned json to the console
                        console.log("success"); // another sanity check
                    },

                    // handle a non-successful response
                    error : function(xhr,errmsg,err) {
                        $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
                            " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
                        console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
                    }

                });
            });

            $('a.toggle-vis').on( 'click', function (e) {
                e.preventDefault();
                // Get the column API object
                var column = _dt.column( $(this).attr('data-column') );

                // Toggle the visibility
                column.visible( ! column.visible() );
            } );
            **/
        });

    };


}