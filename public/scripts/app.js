var app = angular.module("goalsApp", ["ngRoute", "ngStorage", "filters.stringUtils", "angularModalService", "chart.js"]);

app.controller('mainController', function($scope, $localStorage, $sessionStorage, $http)  {
	$scope.orderByField = 'name';
  $scope.reverseSort = false;
	$scope.$storage = $localStorage;
	$scope.$storage.goal = new Goal($http);
	$scope.date = new Date();
	//SET THE FUCKING LOCATION
	$scope.location = 1;
  	$scope.options = { responsive: true, stacked: true, pointstyle: "crossRot" };

  	$scope.labels = ["Current Sales", "Distance From Goal"];
  	$scope.data = [$scope.$storage.goal.dailyProgress, $scope.$storage.goal.dailyGoal];
  	$scope.lastWeekData = [[547.60,1931.64],[500,700,3000,6000,4000,1400,900]];

    $scope.weeklyData = [500,700,
                    3000,
                    6000,4000,
                    200];
    $scope.weeklyLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    $scope.staffList = [];
    $scope.fullStaff = new Staff($http);
    $scope.fullSales = new Sales($http);
    $scope.$storage.fullTactics = new Tactics($http);
    $scope.$storage.staff = {};
    $scope.$storage.staffName = {};

	//$scope.$storage.dailyGoal = new DailyGoal($http);
	//$scope.storage.staff = '';
	$scope.openStaff = function(staffName,day) {
		$scope.$storage.staffName = staffName;
		var array = staffName.split(' ');
		var index = -1;
		count = 0;
		while(count < $scope.fullStaff.staff.length){
			if($scope.fullStaff.staff[count].lastName == array[1]){
				index = count;
				$scope.$storage.staff = $scope.fullStaff.staff[count];
				break;

			}
			count++;
		}
		// set data
		if(day==0){ //daily
			location.href = '#!staff';
		}
		else if(day==1){ //yesterday
			location.href = '#!staffYesterday';
		}
		else if(day==2){ //
			location.href = '#!staffThisWeek';
		}
		else{
			location.href = '#!staffLastWeek';
		}
	};
	
	$scope.callUpdateGoals = function(section)  {
		var newGoal = $('#weeklyGoalInput').val();
		//console.log("Section: " + section);
		if (section == 0)  {
			$http.post("/updateGoals", 
				{
					"location": "10 Barrel Boise",
					"dailyGoal": newGoal,
					"weeklyGoal": $scope.$storage.goal.weeklyGoal
			})
			.then(function(data,status,headers,config)  {
				$scope.$storage.goal.dailyGoal = parseInt(newGoal);
				$scope.data = [$scope.$storage.goal.dailyProgress, Math.abs($scope.$storage.goal.dailyProgress-parseInt(newGoal))];
				//$scope.dailyGoal = $storage.dailyGoal;
			}, function(data,status,headers,config)  {
				console.log("failure");
			});
		} else {
			$http.post("/updateGoals", 
				{
					"location": "10 Barrel Boise",
					"dailyGoal": $scope.$storage.goal.dailyGoal,
					"weeklyGoal": newGoal
      })
      .then(function(data,status,headers,config)  {
        $scope.$storage.goal.weeklyGoal = parseInt(newGoal);
        $scope.data = [$scope.$storage.goal.weeklyProgress, Math.abs($scope.$storage.goal.weeklyProgress-parseInt(newGoal))];
        //$scope.dailyGoal = $storage.dailyGoal;
        
      }, function(data,status,headers,config)  {
        console.log("failure");
      });
         $scope.weeklyData =[parseInt(newGoal)*.05,.1*parseInt(newGoal),.2*parseInt(newGoal),
                        parseInt(newGoal)*.25,parseInt(newGoal)*.4,parseInt(newGoal)*.3,parseInt(newGoal)*.1];
    }
    

  }

  $scope.callGetGoals = function()  {
    $http.get("/goals")
    .then(function(data,status,headers,config) {
      $scope.$storage.goal.dailyGoal = parseInt(data.data[0].dailyGoal);  
      $scope.$storage.goal.dailyProgress = parseInt(data.data[0].dailyProgress);
      $scope.$storage.goal.dailyProjected = parseInt(data.data[0].dailyProjected);
      $scope.$storage.goal.weeklyGoal = parseInt(data.data[0].weeklyGoal);  
      $scope.$storage.goal.weeklyProgress = parseInt(data.data[0].weeklyProgress);
      $scope.$storage.goal.weeklyProjected = parseInt(data.data[0].weeklyProjected);
    },function(data, status, headers, config)  {
      console.log('fail here');
    });
  }

  $scope.callGetTactics = function()  {
    $http.get("/tactics")
    .then(function(data,status,headers,config) {
      $scope.$storage.tactic = data.data[0].tactic;
    }, function(data, status, headers, config)  {
      console.log("fail getting tactics");
    });
  }

  $scope.callUpdateTactic = function(section)  {
    var newTactic = $('#tacticalGoalsInput').val();
    if (section == 0)  {
      $http.post("/updateTactics", 
        {
          "location": "10 Barrel Boise",
          "dailyTactics": newTactic,
          "weeklyTactics": $scope.$storage.fullTactics.tactics[0].dailyTactics
      })
      .then(function(data,status,headers,config)  {
        //$scope.dailyGoal = $storage.dailyGoal;
      }, function(data,status,headers,config)  {
        console.log("failure");
      });
    }
    if (section == 1)  {
      $http.post("/updateTactics", 
        {
          "location": "10 Barrel Boise",
          "dailyTactics": $scope.$storage.fullTactics.tactics[0].weeklyTactics,
          "weeklyTactics": newTactic
      })
      .then(function(data,status,headers,config)  {
        //$scope.dailyGoal = $storage.dailyGoal;
      }, function(data,status,headers,config)  {
        console.log("failure");
      });
    }

  }

  $scope.scheduleStaff = function(staffInfo){
    if(staffInfo.add == "Add"){
      staffInfo.add = "Remove";
      $scope.staffList.push(staffInfo);
    }
    else{
      staffInfo.add = "Add";
      var index = -1;
      count = 0;
      while(count < $scope.staffList.length){
        if($scope.staffList[count] == staffInfo){
          index = count;
          break;
        }
        count++;
      }
      if (index > -1) {
          $scope.staffList.splice(index, 1);
      }
    }
  }
  $scope.updateStaff = function(){
    $http.post("/updateStaff",
    {
      "location" : "10 Barrel Boise",
      "staff" : $scope.staffList
    })
    .then(function(data,status,headers,config)  {
      
    }, function(data,status,headers,config)  {
      console.log('failure');
    });
  }
  $scope.callGetGoals();

    //console.log($scope.$storage.goal.dailyGoal);
  $scope.callGetTactics();


  $scope.switch = function (num) {
    if (num == 0)  {
      $scope.data = [$scope.$storage.goal.dailyProgress, Math.abs($scope.$storage.goal.dailyProgress-$scope.$storage.goal.dailyGoal)];
    } else {
      $scope.data = [$scope.$storage.goal.weeklyProgress, Math.abs($scope.$storage.goal.weeklyProgress-$scope.$storage.goal.weeklyGoal)];
    }
  }

  $scope.staffLocation = function(staff) {
      return staff.location === 1;
  }
  $scope.tacticsLocation = function(tactics) {
      return tactics.location === 1;
  } 

  $scope.onCallOmnivore = function () {
    $http.post("/webhookUpdate/1", 
    {
      'location': '1'
    })
    .then(function(data,status,headers,config)  {
      console.log(data);
    }, function(data,status,headers,config)  {
      console.log("failing over here");
    });
  }

  $scope.onCallLavu = function () {
    $scope.$storage.lavuStaff = {};
    // var api_url = "https://api.poslavu.com/cp/reqserv/";
    // var datanameString = "cerveza_patago13";  
    // var keyString = "XCXxRHUsSuF3n3D4s6Lm";
    // var tokenString = "bsn9GpsHt8UClvnEukGa";
    // var tableString = "orders";
    // var yesterday = new Date();
    // yesterday.setDate(yesterday.getDate() - 1);

    // var config = { headers : {'Content-Type': 'application/json; charset=utf-8'}};

    // var data = JSON.stringify({
    //   dataname:datanameString,
    //   key:keyString,
    //   token:tokenString,
    //   table:tableString,
    //   limit:50,
    //   valid_xml: 1
    // });
    // $http.post(
    //   api_url,
    //   data,
    //   config.headers
    // ).then(function(response)  {
    //   console.log(response);
    //   console.log("Success");
    // }).catch( function(error)  {
    //   console.log("Failure");
    // });
    $http.get("/lookupYesterdayLavu")
    .then(function(response)  {
      var total = 0;
      $(response.data).find('row').each(function()  {
        var $row = $(this);
        var id = $row.find('id').text();
        total += parseFloat($row.find('total').text());
      });

      $scope.$storage.yesterday = {};
      $scope.$storage.lavuStaff.yesterdayTotalOrders = 0;
      $scope.$storage.lavuStaff.yesterdayTotalSales = 0.0;
      $scope.$storage.lavuStaff.yesterday.categories = {};
      $(response.data).find('row').each(function()  {
        var $row = $(this);
        var serverName = $row.find('server').text();
        $scope.$storage.lavuStaff.yesterdayTotalOrders++;
        $scope.$storage.lavuStaff.yesterdayTotalSales += parseFloat($row.find('total').text());
        if ($scope.$storage.lavuStaff.yesterday.hasOwnProperty(serverName))  {
          $scope.$storage.lavuStaff.yesterday[serverName].sales += parseFloat($row.find('total').text());
          $scope.$storage.lavuStaff.yesterday[serverName].orders++;
        } else {
          $scope.$storage.lavuStaff.yesterday[serverName] = {};
          $scope.$storage.lavuStaff.yesterday[serverName].name = serverName;
          $scope.$storage.lavuStaff.yesterday[serverName].sales = parseFloat($row.find('total').text());
          $scope.$storage.lavuStaff.yesterday[serverName].orders = 1;
        }
        getCategoryInfo($row, $scope, $http);
      })
      $scope.$storage.lavuStaff.yesterdayAverageTicket = $scope.$storage.lavuStaff.yesterdayTotalSales / $scope.$storage.lavuStaff.yesterdayTotalOrders;
      console.log(total);
      $http.post("/updateYesterdaySales/1",
      {
        "location": 1,
        "yesterdaySales": total
      })
      .then(function(response)  {
        console.log("Success");
      }, function(response) {
        console.log("failure");
      });
    }, function(response)  {
      console.log("failure");
    });

    $http.get("/lookupLavuToday")
    .then(function(response)  {
      var total = 0;
      $(response.data).find('row').each(function()  {
        var $row = $(this);
        total += parseFloat($row.find('total').text());
      });
      $scope.$storage.lavuStaff.today = {};
      $scope.$storage.lavuStaff.todayTotalOrders = 0;
      $scope.$storage.lavuStaff.todayTotalSales = 0.0;
      $(response.data).find('row').each(function()  {
        var $row = $(this);
        var serverName = $row.find('server').text();
        $scope.$storage.lavuStaff.todayTotalOrders++;
        $scope.$storage.lavuStaff.todayTotalSales += parseFloat($row.find('total').text());
        if ($scope.$storage.lavuStaff.today.hasOwnProperty(serverName))  {
          $scope.$storage.lavuStaff.today[serverName].sales += parseFloat($row.find('total').text());
          $scope.$storage.lavuStaff.today[serverName].orders++;
        } else {
          $scope.$storage.lavuStaff.today[serverName] = {};
          $scope.$storage.lavuStaff.today[serverName].name = serverName;
          $scope.$storage.lavuStaff.today[serverName].sales = parseFloat($row.find('total').text());
          $scope.$storage.lavuStaff.today[serverName].orders = 1;
        }
      })
      $scope.$storage.lavuStaff.todayAverageTicket = $scope.$storage.lavuStaff.todayTotalSales / $scope.$storage.lavuStaff.todayTotalOrders;


      $http.post("/updateTodaySales/1",
      {
        "location": 1,
        "dailyProgress": total
      })
      .then(function(resposne)  {
        console.log("Sucesss");
        console.log($scope.$storage.lavuStaff);
      }, function(resposne)  {
        console.log("failure");
      });
    }, function(response)  {
      console.log("failure");
    });
  }


});

function getCategoryInfo($row, $scope, $http)  {
    var order_id = $row.find('order_id').text();
    $http.get("/lookupLavuOrder_Contents/" + order_id)
    .then(function(response)  {
      $(response.data).find('row').each(function()  {
        var $row2 = $(this);
        var item_id = $row2.find('item_id').text();
        $http.get("/lookupLavuItems/" + item_id)
        .then(function(response2)  {
          var $row3 = $(response2.data).find('row');
          var category_id = $row3.find('category_id').text();
          $http.get("/lookupLavuCategory/" + category_id)
          .then(function(response3)  {
            var $row4 = $(response3.data).find('row');
            var group_id = $row4.find('group_id').text();
            $http.get("/lookupLavuGroup/" + group_id)
            .then(function(response4)  {
              var $row5 = $(response4.data).find('row');
              var group_name = $row5.find('group_name').text();
              if ($scope.$storage.lavuStaff.yesterday.categories.hasOwnProperty(group_name))  {
                $scope.$storage.lavuStaff.yesterday.categories[group_name].sales += parseFloat($row2.find('total_with_tax').text());
                $scope.$storage.lavuStaff.yesterday.categories[group_name].orders += parseFloat($row2.find('quantity').text());
              } else {
                $scope.$storage.lavuStaff.yesterday.categories[group_name] = {}; 
                $scope.$storage.lavuStaff.yesterday.categories[group_name].name = group_name;
                $scope.$storage.lavuStaff.yesterday.categories[group_name].sales = parseFloat($row2.find('total_with_tax').text());
                $scope.$storage.lavuStaff.yesterday.categories[group_name].orders = parseFloat($row2.find('quantity').text());
              }
            }, function(response4)  {
              console.log("fail4");
            });
          }, function(response3)  {
            console.log("fail3");
          });
        }, function(response2)  {
          console.log("fail2");
        });
      });
    }, function(response)  {
      console.log("fail");
    });
  }

function Goal($http)  {
  var dailyGoal = 600;
  var weeklyGoal = 8000;

  $http.get("/goals")
  .then(function(data, status, headers, config)  {
    dailyGoal = parseInt(data.data[0].dailyGoal);
    weeklyGoal = parseInt(data.data[0].weeklyGoal);
    //weeklyProgress = parseInt(data.data[0].weeklyProgress);
    //dailyProgress = parseInt(data.data[0].dailyProgress);
    //weeklyProjected = parseInt(data.data[0].weeklyProjected);
    //dailyProjected = parseInt(data.data[0].dailyProjected);
  },function(data,status,headers,config)  {
    console.log('fail hur');
  });

  this.__defineGetter__("dailyGoal", function () {
        return dailyGoal;
    });

    this.__defineSetter__("dailyGoal", function (val) {        
        val = parseInt(val);
        dailyGoal = val;
    });

    this.__defineGetter__("weeklyGoal", function () {
        return weeklyGoal;
    });

    this.__defineSetter__("weeklyGoal", function (val) {        
        val = parseInt(val);
        weeklyGoal = val;
    });
};
function Staff($http)  {
  //var staff = '';
  staff = [];

  $http.get("/staff")
  .then(function(data, status, headers, config)  {
    staff = data.data;
    //lastName = data.data[0].lastName;
    
  },function(data,status,headers,config)  {
    console.log('fail hur');
  });
  this.__defineGetter__("staff", function () {
        //return {firstName,lastName};
        return staff;
    });

    this.__defineSetter__("staff", function (val) {        
        
    });
};

function Sales($http)  {
  //var staff = '';
  sales = [];

  $http.get("/sales")
  .then(function(data, status, headers, config)  {
    sales = data.data[0];
    //lastName = data.data[0].lastName;
    
  },function(data,status,headers,config)  {
    console.log('fail sales');
  });
  this.__defineGetter__("sales", function () {
        //return {firstName,lastName};
        return sales;
    });

    this.__defineSetter__("sales", function (val) {        
        
    }); 
};

function Tactics($http)  {
  //var staff = '';
  tactics = [];

  $http.get("/tactics")
  .then(function(data, status, headers, config)  {
    tactics = data.data;
    //lastName = data.data[0].lastName;
    
  },function(data,status,headers,config)  {
    console.log('fail tactics');
  });
  this.__defineGetter__("tactics", function () {
        //return {firstName,lastName};
        return tactics;
    });

    this.__defineSetter__("tactics", function (val) {        
        
    });
};


app.config(function($routeProvider) {
  $routeProvider
  .when("/", {

  	templateUrl : "partials/MVP/homeMVP.html"
  })
  .when("/staff", {
  	templateUrl : "partials/MVP/staff.html"
  })
  .when("/history", {
      templateUrl : "partials/history.html"
  })
  .when("/insights", {
      templateUrl : "partials/insights.html"
  })
  //.when("/staff", {
  //	templateUrl : "partials/staff.html"
  //})
  .when("/yesterdayTab", {
    templateUrl : "partials/yesterdayTab.html"
  })
  .when("/setGoal", {
    templateUrl : "partials/setGoal.html"
  })
  .when("/adjustStaffGoals", {
    templateUrl : "partials/adjustStaffGoals.html"
  })
  .when("/weeklyGoals", {
    templateUrl : "partials/setWeeklyGoals.html"
  })
  .when("/weeklyGoalsTab", {
    templateUrl : "partials/weeklyGoalsTab.html"
  })
  .when("/daily", {
    templateUrl : "partials/setDailyGoals.html"
  })
  .when("/tips", {
    templateUrl : "partials/tips.html"
  })
    .when("/lastWeek", {
    templateUrl : "partials/MVP/lastWeek.html"
  })
    .when("/staffYesterday", {
    templateUrl : "partials/staffYesterday.html"
  })
    .when("/staffLastWeek", {
  	templateUrl : "partials/staffLastWeek.html"
  })
    .when("/staffThisWeek", {
  	templateUrl : "partials/staffThisWeek.html"
  });
    
});
app.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });

  

    filtered.sort(function (a, b) {
      if(field=="avgTicket" || field=="percentToAvg"){
          return(a["sales"]/a["orders"] > b["sales"]/b["orders"]? 1: -1);
      }
      else{
        console.log(field);
        return (a[field] > b[field] ? 1 : -1);
      }
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});


app.run(function ($rootScope, $location, $localStorage) {

    var history = [];

    $localStorage.history = history;

    $rootScope.$on('$routeChangeSuccess', function() {
        //history.push($location.$$path);
        $localStorage.history.push($location.$$path);

    });

    $rootScope.back = function () {
      var prevUrl = $localStorage.history.length > 1 ? $localStorage.history.splice(-2)[0] : "/";
        //var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
        $location.path(prevUrl);
    };

});

angular.module('filters.stringUtils', [])

.filter('removeSpaces', [function() {
    return function(string) {
        if (!angular.isString(string)) {
            return string;
        }
        return string.replace(/[\s]/g, '');
    };
}]);

$(app).ready(function(){
    $("pp").click(function(){
        $(this).hide();
    });
});





// app.service("Contacts", function($http) {
//   this.getContacts = function() {
//     return $http.get("/contacts").
//       then(function(response) {
//         return response;
//       }, function(response) {
//         alert("Error retrieving contacts.");
//       });
//   }
// });