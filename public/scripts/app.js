/* global angular */
/* global moment */
/* global _ */

var app = angular.module("goalsApp", ["ngRoute", "ngStorage", "filters.stringUtils", "filters.mathAbs", "angularModalService", "chart.js"]);

app.controller('mainController', function($scope, $localStorage, $sessionStorage, $http, $location) {
	$scope.randomNumber = 1;
	$scope.orderByField = 'name';
	$scope.reverseSort = false;
	$scope.$storage = $localStorage;
	$scope.$storage.goal = new Goal($http);
	$scope.date = new Date();
	$scope.data = {};
	$scope.dateRange = $scope.date.getMonth()+1+'/'+
	$scope.date.getDate(); //default is weekToDate
	$scope.$storage.salesDate = moment().toDate();
	$scope.$storage.salesDateMax = null;
	$scope.$storage.staffInfo = null;

	// $scope.$storage.INCENTIVE = INCENTIVE;
  $scope.$storage.weeklyIncentiveGoal = 20;
	$scope.$storage.dailyHardGoal = 200000;
	$scope.$storage.dailyHardIncentiveGoal = 45;
	$scope.$storage.dailyHardIncentiveProjection = 45;
	$scope.$storage.yesterdayHardGoal = 199000;
	$scope.$storage.yesterdayHardIncentiveGoal = 43;
	$scope.$storage.yesterdayHardIncentiveProjection = 49;

	$scope.loading = false;
	$scope.filteredLocations = [];
	$scope.locationSearchText = null;
	

	$scope.getYesterdayDate = function(){
    	var date = new Date();
    	return date.setDate(date.getDate() - 1);
  	};
 	$scope.getDateRange = function(section){
    	if(section == 0){ //today's date
    		var date = new Date();
    		$scope.dateRange = date.getMonth()+1+'/'+date.getDate();
    	}
    	else if(section == 1){ //yesterday's date
    	    var date = new Date($scope.getYesterdayDate());
        	$scope.dateRange = date.getMonth()+1+'/'+date.getDate();
    	}
	    else if(section == 2){ // last week dates
	    	var start = new Date();
	    	while(start.getDay()>1){
	    		start.setDate(start.getDate()-1);
	    	}
	    	var end = new Date();
	    	while(end.getDay()>0){
	    		end.setDate(end.getDate()+1);
	    	}
	    	start.setDate(start.getDate()-7);
	    	end.setDate(end.getDate()-7);
	    	$scope.dateRange = (start.getMonth()+1)+'/'+start.getDate()+'-'+ (end.getMonth()+1) + '/' + end.getDate();;;
	    }
	    else if(section == 3){ // month to date
	    	var date = new Date();
	        $scope.dateRange = date.getMonth()+1+'/1-'+(date.getMonth()+1)+'/'+date.getDate();
	    }
	    else if(section == 4){ // week to date
			var start = new Date();
	    	while(start.getDay()>1){
	    		start.setDate(start.getDate()-1);
	    	}
	    	var end = new Date();
	        $scope.dateRange = (start.getMonth()+1) + '/' + start.getDate()  +'-'+ (end.getMonth()+1) + '/' + end.getDate();;
	    }
	};
	var counter = 0;
	$scope.getRandomAvatar = function(){
		//$scope.randomNumber = 
		var n = Math.floor((Math.random() * 100) + 1)%4;
		var avatars = ['assets/images/staffPic1.png','assets/images/staffPic2.png','assets/images/staffPic3.png','assets/images/staffPic4.png'];
		return avatars[0];
	}
	$scope.$watch('locationSearchText', (n,o) => {
		console.log(n);
		var query = (n||'').toLowerCase();
		if(query)
			$scope.filteredLocations = _.filter($scope.$storage.allLocations, function(l) { return l.name.toLowerCase().indexOf(query) >= 0; });
		else
			$scope.filteredLocations = $scope.$storage.allLocations;
	});

  $scope.$watch('$storage.incentiveCategory', function(newValue, oldValue) {
    //console.log(newValue);
    $scope.$storage.incentiveItems = _.filter($scope.$storage.menuitems, function(item) {
    	if (newValue)  {
      		return item.category_id == newValue.id;
      	}
    });
    //console.log($scope.$storage.incentiveItems);
  });

  $scope.$watch('$storage.incentiveItem', function(newValue, oldValue) {
    //console.log(newValue);
    console.log(newValue);
    console.log(oldValue);
    //console.log($scope.$storage.incentiveItems);
  });

	$scope.setSalesDate = function(date) {
		if(date === 'TODAY') {
			$scope.$storage.salesDate = moment().format('YYYYMMDD');
			$scope.$storage.salesDateMax = null;
		}
		else if(date === 'YESTERDAY') {
			$scope.$storage.salesDate = moment().subtract(1, 'day').format('YYYYMMDD');
			$scope.$storage.salesDateMax = null;
		}
	    else if(date === 'WEEKTODATE')  {
	      $scope.$storage.salesDate = moment().startOf('isoWeek').format('YYYYMMDD');
	      $scope.$storage.salesDateMax = moment().endOf('isoWeek').format('YYYYMMDD');
	    }
		else if(date === 'LASTWEEK') {
			$scope.$storage.salesDate = moment().subtract(7, 'day').startOf('isoWeek').format('YYYYMMDD');
			$scope.$storage.salesDateMax = moment().subtract(7, 'day').endOf('isoWeek').format('YYYYMMDD');
		}
		else if(date === 'MONTHLY') {
			$scope.$storage.salesDate = moment().startOf('month').format('YYYYMMDD');
			$scope.$storage.salesDateMax = moment().endOf('month').format('YYYYMMDD');
		}
		$scope.loadSalesData();
    
	};

	$scope.location = null;

	$scope.options = { responsive: true, stacked: true, pointstyle: "crossRot" };

	$scope.labels = ["Current Sales", "Distance From Goal"];
	// $scope.yesterdayData = [$scope.$storage.lavuStaff.yesterdayTotalSales, 200000];
	// $scope.todayData = [$scope.$storage.lavuStaff.todayTotalSales, 200000];
	//$scope.data = [$scope.$storage.goal.dailyProgress, $scope.$storage.goal.dailyGoal];
	$scope.lastWeekData = [
		[547.60, 1931.64],
		[500, 700, 3000, 6000, 4000, 1400, 900]
	];

	$scope.weeklyData = [500, 700,
		3000,
		6000, 4000,
		200
	];
	$scope.weeklyLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	$scope.staffList = [];
	$scope.fullStaff = new Staff($http);
	$scope.fullSales = new Sales($http);
	$scope.$storage.fullTactics = new Tactics($http);
	$scope.$storage.staff = {};
	$scope.$storage.staffName = {};

	$scope.init = function() {
		$scope.$storage.salesDate = moment().format('YYYYMMDD');
		if($scope.$storage.location){
			// Preload data if we've got a saved location
      $scope.loadIncentiveData();
			$scope.loadSalesData();
		}
		if (!$scope.$storage.allLocations) {
			$http.get('/locations').then(function(response) {
				$scope.$storage.allLocations = response.data;
				$scope.filteredLocations = $scope.$storage.allLocations;
				$scope.locationSearchText = null;
			});
		}
	};

	//$scope.$storage.dailyGoal = new DailyGoal($http);
	//$scope.storage.staff = '';
	$scope.gateLocation = function() {
		return (typeof $scope.$storage.location === 'undefined');
	};

	$scope.updateLocation = function(id, goHome) {
		$scope.locationSearchText = null;
		
		$http.get("/resolveLocation/" + id)
			.then(function(response) {
				$scope.$storage.location = id;
				$scope.$storage.locationData = response.data;
				$scope.$storage.lavuStaff = {};
				$scope.$storage.sales = {};
				$scope.$storage.staffSales = {};
				$scope.$storage.salesDate = moment().format('YYYYMMDD');

        $scope.loadIncentiveData();
				$scope.loadSalesData();
				//$scope.onCallLavuToday();
				//$scope.onCallLavuYesterday();
				//$scope.onCallLavuLastWeek();
				$location.path('');
			}, function(response) {
				console.log("Failure gating");
			});
	};

	$scope.openStaff = function(staffInfo) {
		$scope.$storage.staffInfo = staffInfo;
		location.href = "#!individualStaff"
		console.log(staffInfo);
	};

	$scope.callUpdateGoals = function() {
		$scope.$storage.goals[$scope.$storage.salesDate].value=$('#salesGoalInput').val();
	    $http.post("/locations/" + $scope.$storage.location + "/goals/" + $scope.$storage.goals[$scope.$storage.salesDate].type + "/" + $scope.$storage.salesDate, {
	      "value": $scope.$storage.goals[$scope.$storage.salesDate].value
	    })
	    .then(function(response)  {
	      console.log($scope.$storage.goals);
	    }, function(resposne)  {
	      console.log("Failing here");
	    });

		// var newGoal = $('#weeklyGoalInput').val();
		// //console.log("Section: " + section);
		// if (section == 0) {
		// 	$http.post("/updateGoals", {
		// 			"location": "10 Barrel Boise",
		// 			"dailyGoal": newGoal,
		// 			"weeklyGoal": $scope.$storage.goal.weeklyGoal
		// 		})
		// 		.then(function(data, status, headers, config) {
		// 			$scope.$storage.goal.dailyGoal = parseInt(newGoal);
		// 			$scope.data = [$scope.$storage.goal.dailyProgress, Math.abs($scope.$storage.goal.dailyProgress - parseInt(newGoal))];
		// 			//$scope.dailyGoal = $storage.dailyGoal;
		// 		}, function(data, status, headers, config) {
		// 			console.log("failure");
		// 		});
		// }
		// else {
		// 	$http.post("/updateGoals", {
		// 			"location": "10 Barrel Boise",
		// 			"dailyGoal": $scope.$storage.goal.dailyGoal,
		// 			"weeklyGoal": newGoal
		// 		})
		// 		.then(function(data, status, headers, config) {
		// 			$scope.$storage.goal.weeklyGoal = parseInt(newGoal);
		// 			$scope.data = [$scope.$storage.goal.weeklyProgress, Math.abs($scope.$storage.goal.weeklyProgress - parseInt(newGoal))];
		// 			//$scope.dailyGoal = $storage.dailyGoal;

		// 		}, function(data, status, headers, config) {
		// 			console.log("failure");
		// 		});
		// 	$scope.weeklyData = [parseInt(newGoal) * .05, .1 * parseInt(newGoal), .2 * parseInt(newGoal),
		// 		parseInt(newGoal) * .25, parseInt(newGoal) * .4, parseInt(newGoal) * .3, parseInt(newGoal) * .1
		// 	];
		// }


	}

	$scope.callGetGoals = function() {
		$http.get("/goals")
			.then(function(data, status, headers, config) {
				$scope.$storage.goal.dailyGoal = parseInt(data.data[0].dailyGoal);
				$scope.$storage.goal.dailyProgress = parseInt(data.data[0].dailyProgress);
				$scope.$storage.goal.dailyProjected = parseInt(data.data[0].dailyProjected);
				$scope.$storage.goal.weeklyGoal = parseInt(data.data[0].weeklyGoal);
				$scope.$storage.goal.weeklyProgress = parseInt(data.data[0].weeklyProgress);
				$scope.$storage.goal.weeklyProjected = parseInt(data.data[0].weeklyProjected);
			}, function(data, status, headers, config) {
				console.log('fail here');
			});
	}

	$scope.callGetTactics = function() {
		$http.get("/tactics")
			.then(function(data, status, headers, config) {
				if (data.data[0])  {
					$scope.$storage.tactic = data.data[0].tactic;
				}
			}, function(data, status, headers, config) {
				console.log("fail getting tactics");
			});
	}

	$scope.callUpdateTactic = function(section) {
		var newTactic = $('#tacticalGoalsInput').val();
		if (section == 0) {
			$http.post("/updateTactics", {
					"location": "10 Barrel Boise",
					"dailyTactics": newTactic,
					"weeklyTactics": $scope.$storage.fullTactics.tactics[0].dailyTactics
				})
				.then(function(data, status, headers, config) {
					//$scope.dailyGoal = $storage.dailyGoal;
				}, function(data, status, headers, config) {
					console.log("failure");
				});
		}
		if (section == 1) {
			$http.post("/updateTactics", {
					"location": "10 Barrel Boise",
					"dailyTactics": $scope.$storage.fullTactics.tactics[0].weeklyTactics,
					"weeklyTactics": newTactic
				})
				.then(function(data, status, headers, config) {
					//$scope.dailyGoal = $storage.dailyGoal;
				}, function(data, status, headers, config) {
					console.log("failure");
				});
		}

	}

	$scope.scheduleStaff = function(staffInfo) {
		if (staffInfo.add == "Add") {
			staffInfo.add = "Remove";
			$scope.staffList.push(staffInfo);
		}
		else {
			staffInfo.add = "Add";
			var index = -1;
			count = 0;
			while (count < $scope.staffList.length) {
				if ($scope.staffList[count] == staffInfo) {
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
	$scope.updateStaff = function() {
		$http.post("/updateStaff", {
				"location": "10 Barrel Boise",
				"staff": $scope.staffList
			})
			.then(function(data, status, headers, config) {

			}, function(data, status, headers, config) {
				console.log('failure');
			});
	}
	$scope.callGetGoals();

	//console.log($scope.$storage.goal.dailyGoal);
	$scope.callGetTactics();


	$scope.switch = function(num) {
		if (num == 0) {
			$scope.data = [$scope.$storage.goal.dailyProgress, Math.abs($scope.$storage.goal.dailyProgress - $scope.$storage.goal.dailyGoal)];
		}
		else {
			$scope.data = [$scope.$storage.goal.weeklyProgress, Math.abs($scope.$storage.goal.weeklyProgress - $scope.$storage.goal.weeklyGoal)];
		}
	}

	$scope.staffLocation = function(staff) {
		return staff.location === 1;
	}
	$scope.tacticsLocation = function(tactics) {
		return tactics.location === 1;
	}

	$scope.onReloadLocation = function() {
		delete $localStorage.location;
	}

	$scope.onCallOmnivore = function() {
		$http.post("/webhookUpdate/1", {
				'location': '1'
			})
			.then(function(data, status, headers, config) {
				console.log(data);
			}, function(data, status, headers, config) {
				console.log("failing over here");
			});
	}

	$scope.getSalesDate = function() {
		return moment().format('YYYYMMDD');
	}

	$scope.getSalesDate = function(offset) {
		return moment().add(offset, 'days').format('YYYYMMDD');
	}

  $scope.loadIncentiveData = function()  {
    var date = $scope.$storage.salesDate;
    $scope.loading = true;

    $http.get('/locations/' + $scope.$storage.location + '/menucategories')
    .then(function(response)  {
      console.log("Categories");
      console.log(response);
      if (!$scope.$storage.menugroups) $scope.$storage.menucategories = {};
      $scope.$storage.menucategories = response.data.data;
      $http.get('/locations/' + $scope.$storage.location + '/menuitems')
      .then(function(response) {
        $scope.$storage.menuitems = response.data.data;
        $http.get('/locations/' + $scope.$storage.location + '/incentives/weekly')
        .then(function(response)  {
          if (!$scope.$storage.incentive) $scope.$storage.incentive = {};
          console.log("Weekly incentive");
          console.log(response);
          if (response.data.data[0])  {
          	$scope.$storage.incentiveCategory = response.data.data[0];
          	$scope.$storage.weeklyIncentiveGoal = response.data.data[0].goal;
          }
        }, function(response)  {
          console.log("fail");
        });
      });
    });
  }

	$scope.loadSalesData = function(refresh) {
    $scope.error = false;
		$scope.$storage.incentiveId = 0;

		var date = $scope.$storage.salesDate;
		$scope.loading = true;
		$http.get("/locations/" + $scope.$storage.location + "/salessummary/" + date + ($scope.$storage.salesDateMax ? '/' + $scope.$storage.salesDateMax : '') + (refresh ? '?refresh=true' : ''))
		.then(function(response) {
			if (!$scope.$storage.sales) $scope.$storage.sales = {};
			// $scope.$storage.sales[date.format('YYYYMMDD')] = response.data.data;
			let salesData = $scope.$storage.sales[date] = response.data.data;
			salesData.averageOrderPrice = salesData.totalSales / salesData.totalOrders;

			console.log($scope.$storage.sales);

			$http.get('/locations/' + $scope.$storage.location + '/staffsales/' + date + ($scope.$storage.salesDateMax ? '/' + $scope.$storage.salesDateMax : '') + (refresh ? '?refresh=true' : ''))
			.then(function(response) {
				if (!$scope.$storage.staffSales) $scope.$storage.staffSales = {};
				console.log('staff');
				console.log(response);
				$scope.$storage.staffSales[date] = response.data.data;
	          // var from_date = moment().startOf('week').format('YYYYMMDD');
	          // var to_date = moment().endOf('week').format('YYYYMMDD');
	          	var from_date = moment().startOf('isoWeek').format('YYYYMMDD');
	            var to_date = moment().endOf('isoWeek').format('YYYYMMDD');
	          	$http.get('/locations/' + $scope.$storage.location + '/salessummary/' + from_date + '/' + to_date + (refresh ? '?refresh=true' : ''))
	          	.then(function(response)  {
            	console.log("Week to date");
            	console.log(response);
            	$scope.$storage.weekToDate = response.data.data;

	            $http.get('/locations/' + $scope.$storage.location + '/goals/' + date + ($scope.$storage.salesDateMax ? '/' + $scope.$storage.salesDateMax : '') + (refresh ? '?refresh=true' : ''))
	            .then(function (response)  {
	              if (!$scope.$storage.goals) $scope.$storage.goals = {};
	              if (response.data.data.length == 0)  { //empty response
	                $scope.$storage.goals[date] = {};
	                $scope.$storage.goals[date].value = 0;
	                if ($scope.$storage.salesDate == moment().startOf('month').format('YYYYMMDD'))  {
	                	$scope.$storage.goals[date].type = 'monthly';
	                } 
	                else if ($scope.$storage.salesDateMax) {
	                  $scope.$storage.goals[date].type = 'weekly';
	                } else {
	                  $scope.$storage.goals[date].type = 'daily';
	                }
	              } 
	              else {
	                $scope.$storage.goals[date] = response.data.data[0];

	                if (!$scope.$storage.salesDateMax)  { // not weekly/monthly
	                  if (response.data.data[0].type == 'weekly')  { // no daily goal set yet
	                    switch(moment(date).day())  {
	                      case 0:
	                        $scope.$storage.goals[date].value = $scope.$storage.goals[date].value * 0.10;
	                        break;
	                      case 1:
	                        $scope.$storage.goals[date].value = $scope.$storage.goals[date].value * 0.04;
	                        break;
	                      case 2:
	                        $scope.$storage.goals[date].value = $scope.$storage.goals[date].value * 0.04;
	                        break;
	                      case 3:
	                        $scope.$storage.goals[date].value = $scope.$storage.goals[date].value * 0.07;
	                        break;
	                      case 4:
	                        $scope.$storage.goals[date].value = $scope.$storage.goals[date].value * 0.10;
	                        break;
	                      case 5:
	                        $scope.$storage.goals[date].value = $scope.$storage.goals[date].value * 0.30;
	                        break;
	                      case 6:
	                        $scope.$storage.goals[date].value = $scope.$storage.goals[date].value * 0.35;
	                        break;
	                    }
	                    $http.post('/locations/' + $scope.$storage.location + '/goals/daily/' + date, {
	                      "value" : $scope.$storage.goals[date].value
	                    })
	                    .then(function (response)  {
	                      console.log("Success");
	                    }, function(resposne)  {
	                      console.log("Failure");
	                    });
	                    console.log($scope.$storage.goals);
	                  }
	                  // else {
	                  // 	$scope.$storage.goals[date].type = 'monthly';
	                  // 	$http.post('/locations/' + $scope.$storage.location + '/goals/monthly/' + date, {
	                  //     "value" : $scope.$storage.goals[date].value
	                  //   })
	                  //   .then(function (response)  {
	                  //     console.log("Succcess");
	                  //   }, function(resposne)  {
	                  //     console.log("Failure");
	                  //   });
	                  // }
	                }
	              }
	              console.log($scope.$storage.sales);
	              $scope.loading = false;  
	            });
	          });
			});
		}, function(response) {
      $scope.loading = false;
      $scope.error = true;
			console.log("failure grabbing sales data");
		});
	}

	$scope.onCallLavuToday = function() {
		$scope.$storage.lavuStaff.today = {};
		$scope.$storage.lavuStaff.today.staff = {};
		$scope.$storage.lavuStaff.today.incentiveSales = {};
		$scope.$storage.lavuStaff.today.totalIncentiveSales = 0.0;
		$scope.$storage.lavuStaff.today.totalIncentiveOrders = 0;
		$http.get("/lookupLavuToday")
			.then(function(response) {
				var total = 0;
				$(response.data).find('row').each(function() {
					var $row = $(this);
					total += parseFloat($row.find('total').text());
				});
				//$scope.$storage.lavuStaff.today = {};
				$scope.$storage.lavuStaff.todayTotalOrders = 0;
				$scope.$storage.lavuStaff.todayTotalSales = 0.0;
				$scope.$storage.lavuStaff.today.categories = {};
				$(response.data).find('row').each(function() {
					var $row = $(this);
					var serverName = $row.find('server').text();
					$scope.$storage.lavuStaff.todayTotalOrders++;
					$scope.$storage.lavuStaff.todayTotalSales += parseFloat($row.find('total').text());
					if ($scope.$storage.lavuStaff.today.staff.hasOwnProperty(serverName)) {
						$scope.$storage.lavuStaff.today.staff[serverName].sales += parseFloat($row.find('total').text());
						$scope.$storage.lavuStaff.today.staff[serverName].orders++;
					}
					else {
						$scope.$storage.lavuStaff.today.staff[serverName] = {};
						$scope.$storage.lavuStaff.today.staff[serverName].name = serverName;
						$scope.$storage.lavuStaff.today.staff[serverName].sales = parseFloat($row.find('total').text());
						$scope.$storage.lavuStaff.today.staff[serverName].orders = 1;
					}
					getCategoryInfo($row, $scope, $http, "today");
				});
				$scope.$storage.lavuStaff.todayAverageTicket = $scope.$storage.lavuStaff.todayTotalSales / $scope.$storage.lavuStaff.todayTotalOrders;

				$scope.yesterdayData = [$scope.$storage.lavuStaff.yesterdayTotalSales, 200000];
				$scope.todayData = [$scope.$storage.lavuStaff.todayTotalSales, 200000];
				$http.post("/updateTodaySales/1", {
						"location": 1,
						"dailyProgress": total
					})
					.then(function(resposne) {
						console.log("Sucesss");
						console.log($scope.$storage.lavuStaff);
					}, function(resposne) {
						console.log("failure");
					});
				$scope.onCallLavuYesterday();
			}, function(response) {
				console.log("failure");
			});
	}

	$scope.onCallLavuYesterday = function() {
		$scope.$storage.lavuStaff.yesterday = {};
		$scope.$storage.lavuStaff.yesterday.staff = {};
		$scope.$storage.lavuStaff.yesterday.incentiveSales = {};
		$scope.$storage.lavuStaff.yesterday.totalIncentiveSales = 0.0;
		$scope.$storage.lavuStaff.yesterday.totalIncentiveOrders = 0;
		$http.get("/lookupYesterdayLavu")
			.then(function(response) {
				console.log(response);
				$scope.$storage.lavuStaff.yesterdayTotalOrders = 0;
				$scope.$storage.lavuStaff.yesterdayTotalSales = 0.0;
				$scope.$storage.lavuStaff.yesterday.categories = {};
				$(response.data).find('row').each(function() {
					var $row = $(this);
					var serverName = $row.find('server').text();
					$scope.$storage.lavuStaff.yesterdayTotalOrders++;
					$scope.$storage.lavuStaff.yesterdayTotalSales += parseFloat($row.find('total').text());
					if ($scope.$storage.lavuStaff.yesterday.staff.hasOwnProperty(serverName)) {
						$scope.$storage.lavuStaff.yesterday.staff[serverName].sales += parseFloat($row.find('total').text());
						$scope.$storage.lavuStaff.yesterday.staff[serverName].orders++;
					}
					else {
						$scope.$storage.lavuStaff.yesterday.staff[serverName] = {};
						$scope.$storage.lavuStaff.yesterday.staff[serverName].name = serverName;
						$scope.$storage.lavuStaff.yesterday.staff[serverName].sales = parseFloat($row.find('total').text());
						$scope.$storage.lavuStaff.yesterday.staff[serverName].orders = 1;
					}
					//getCategoryInfo($row, $scope, $http, "yesterday");
				});
				$scope.$storage.lavuStaff.yesterdayAverageTicket = $scope.$storage.lavuStaff.yesterdayTotalSales / $scope.$storage.lavuStaff.yesterdayTotalOrders;

				console.log("THIs");
				console.log(response);
				// //$scope.$storage.lavuStaff.yesterday = {};
				// // $scope.$storage.lavuStaff.yesterdayTotalOrders = 0;
				// // $scope.$storage.lavuStaff.yesterdayTotalSales = 0.0;
				// // $scope.$storage.lavuStaff.yesterday.categories = {};

				//   // $scope.$storage.lavuStaff.yesterdayTotalOrders++;
				//   // $scope.$storage.lavuStaff.yesterdayTotalSales += parseFloat($row.find('total').text());
				// $http.post("/updateYesterdaySales/1",
				// {
				//   "location": 1,
				//   "yesterdaySales": total
				// })
				// .then(function(response)  {
				//   console.log("Success");
				// }, function(response) {
				//   console.log("I am failing here");
				// });
			}, function(response) {
				console.log("Or Here");
			});
	}


	$scope.onCallLavuLastWeek = function() {
		$scope.$storage.lavuStaff.lastWeek = {};
		$scope.$storage.lavuStaff.lastWeek.staff = {};
		$scope.$storage.lavuStaff.lastWeek.incentiveSales = {};
		$scope.$storage.lavuStaff.lastWeek.totalIncentiveSales = 0.0;
		$scope.$storage.lavuStaff.lastWeek.totalIncentiveOrders = 0;
		$http.get("/lookupLastWeekLavu")
			.then(function(response) {
				var total = 0;
				$(response.data).find('row').each(function() {
					var $row = $(this);
					var id = $row.find('id').text();
					total += parseFloat($row.find('total').text());
				});

				//$scope.$storage.lavuStaff.yesterday = {};
				$scope.$storage.lavuStaff.lastWeekTotalOrders = 0;
				$scope.$storage.lavuStaff.lastWeekTotalSales = 0.0;
				$scope.$storage.lavuStaff.lastWeek.categories = {};
				$(response.data).find('row').each(function() {
					var $row = $(this);
					var serverName = $row.find('server').text();
					$scope.$storage.lavuStaff.lastWeekTotalOrders++;
					$scope.$storage.lavuStaff.lastWeekTotalSales += parseFloat($row.find('total').text());
					if ($scope.$storage.lavuStaff.lastWeek.staff.hasOwnProperty(serverName)) {
						$scope.$storage.lavuStaff.lastWeek.staff[serverName].sales += parseFloat($row.find('total').text());
						$scope.$storage.lavuStaff.lastWeek.staff[serverName].orders++;
					}
					else {
						$scope.$storage.lavuStaff.lastWeek.staff[serverName] = {};
						$scope.$storage.lavuStaff.lastWeek.staff[serverName].name = serverName;
						$scope.$storage.lavuStaff.lastWeek.staff[serverName].sales = parseFloat($row.find('total').text());
						$scope.$storage.lavuStaff.lastWeek.staff[serverName].orders = 1;
					}
					getCategoryInfo($row, $scope, $http, "lastWeek");
				})
				$scope.data.lastWeek = [$scope.$storage.lavuStaff.lastWeekTotalSales, $scope.$storage.goal.dailyGoal];
				$scope.$storage.lavuStaff.lastWeekAverageTicket = $scope.$storage.lavuStaff.lastWeekTotalSales / $scope.$storage.lavuStaff.lastWeekTotalOrders;

			}, function(response) {
				console.log("failure");
			});
	};

	$scope.onCallLavuMonthly = function() {
		$scope.$storage.lavuStaff.monthly = {};
		$scope.$storage.lavuStaff.monthly.staff = {};
		$scope.$storage.lavuStaff.monthly.incentiveSales = {};
		$scope.$storage.lavuStaff.monthly.totalIncentiveSales = 0.0;
		$scope.$storage.lavuStaff.monthly.totalIncentiveOrders = 0;
		$http.get("/lookupLastMonthLavu")
			.then(function(response) {
				var total = 0;
				$(response.data).find('row').each(function() {
					var $row = $(this);
					var id = $row.find('id').text();
					total += parseFloat($row.find('total').text());
				});

				//$scope.$storage.lavuStaff.yesterday = {};
				$scope.$storage.lavuStaff.monthlyTotalOrders = 0;
				$scope.$storage.lavuStaff.monthlyTotalSales = 0.0;
				$scope.$storage.lavuStaff.monthly.categories = {};
				$(response.data).find('row').each(function() {
					var $row = $(this);
					var serverName = $row.find('server').text();
					$scope.$storage.lavuStaff.monthlyTotalOrders++;
					$scope.$storage.lavuStaff.monthlyTotalSales += parseFloat($row.find('total').text());
					if ($scope.$storage.lavuStaff.monthly.staff.hasOwnProperty(serverName)) {
						$scope.$storage.lavuStaff.monthly.staff[serverName].sales += parseFloat($row.find('total').text());
						$scope.$storage.lavuStaff.monthly.staff[serverName].orders++;
					}
					else {
						$scope.$storage.lavuStaff.monthly.staff[serverName] = {};
						$scope.$storage.lavuStaff.monthly.staff[serverName].name = serverName;
						$scope.$storage.lavuStaff.monthly.staff[serverName].sales = parseFloat($row.find('total').text());
						$scope.$storage.lavuStaff.monthly.staff[serverName].orders = 1;
					}
					getCategoryInfo($row, $scope, $http, "monthly");
				})
				$scope.data.monthly = [$scope.$storage.lavuStaff.monthlyTotalSales, $scope.$storage.goal.dailyGoal];
				$scope.$storage.lavuStaff.monthlyAverageTicket = $scope.$storage.lavuStaff.monthlyTotalSales / $scope.$storage.lavuStaff.monthlyTotalOrders;

			}, function(response) {
				console.log("failure");
			});
	};

  $scope.updateGoals = function() {
    $http.post('/locations/' + $scope.$storage.location + '/goals/weekly', {
      "value": 200
    })
    .then(function(response)  {
      console.log("Succeess updating");
    }, function(response)  {
      console.log("Failing");
    });
  }

  $scope.getWeekGoalsLavu = function()  {
    $http.get('/locations/' + $scope.$storage.location + '/goals/weekly')
    .then(function(response)  {
      console.log(response);
    }, function(response)  {
      console.log(response);
    });
  }

  $scope.updateIncentive = function()  {
  	
    $http.post('/locations/' + $scope.$storage.location + '/incentives/weekly', {
      "incentive": $scope.$storage.incentiveItem,
      "goal": parseInt($scope.$storage.weeklyIncentiveGoal)
    })
    .then(function(response)  {
      console.log("Updating incentive");
    }, function(response)  {
      console.log("Failing in incentive on change");
    });
  }

  $scope.getWeekGoalsLavu();

	$scope.init();

});

function getCategoryInfo($row, $scope, $http, period) {
	var order_id = $row.find('order_id').text();
	$http.get("/lookupLavuOrder_Contents/" + order_id)
		.then(function(response) {
			$(response.data).find('row').each(function() {
				var $row2 = $(this);
				var item_id = $row2.find('item_id').text();
				$http.get("/lookupLavuItems/" + item_id)
					.then(function(response2) {
						var $row3 = $(response2.data).find('row');
						var category_id = $row3.find('category_id').text();
						$http.get("/lookupLavuCategory/" + category_id)
							.then(function(response3) {
								var $row4 = $(response3.data).find('row');
								var group_id = $row4.find('group_id').text();
								$http.get("/lookupLavuGroup/" + group_id)
									.then(function(response4) {
										var $row5 = $(response4.data).find('row');
										var group_name = $row5.find('group_name').text();
										if ($scope.$storage.lavuStaff[period].categories.hasOwnProperty(group_name)) {
											$scope.$storage.lavuStaff[period].categories[group_name].sales += parseFloat($row2.find('total_with_tax').text());
											$scope.$storage.lavuStaff[period].categories[group_name].orders += parseFloat($row2.find('quantity').text());
										}
										else {
											$scope.$storage.lavuStaff[period].categories[group_name] = {};
											$scope.$storage.lavuStaff[period].categories[group_name].name = group_name;
											$scope.$storage.lavuStaff[period].categories[group_name].sales = parseFloat($row2.find('total_with_tax').text());
											$scope.$storage.lavuStaff[period].categories[group_name].orders = parseFloat($row2.find('quantity').text());
										}
										if (item_id == $scope.$storage.incentiveId) {
											var server = $row.find('server').text();
											if ($scope.$storage.lavuStaff[period].incentiveSales.hasOwnProperty(server)) {
												$scope.$storage.lavuStaff[period].incentiveSales[server].sales += parseFloat($row2.find('total_with_tax').text());
												$scope.$storage.lavuStaff[period].incentiveSales[server].orders += parseFloat($row2.find('quantity').text());
											}
											else {
												$scope.$storage.lavuStaff[period].incentiveSales[server] = {};
												$scope.$storage.lavuStaff[period].incentiveSales[server].name = server;
												$scope.$storage.lavuStaff[period].incentiveSales[server].sales = parseFloat($row2.find('total_with_tax').text());
												$scope.$storage.lavuStaff[period].incentiveSales[server].orders = parseFloat($row2.find('quantity').text());
											}
											if ($scope.$storage.lavuStaff[period].hasOwnProperty('totalIncentiveSales')) {
												$scope.$storage.lavuStaff[period].totalIncentiveSales += parseFloat($row2.find('total_with_tax').text());
												$scope.$storage.lavuStaff[period].totalIncentiveOrders += parseFloat($row2.find('quantity').text());
											}
											else {
												$scope.$storage.lavuStaff[period].totalIncentiveSales = parseFloat($row2.find('total_with_tax').text());
												$scope.$storage.lavuStaff[period].totalIncentiveOrders = parseFloat($row2.find('quantity').text());
											}
										}
									}, function(response4) {
										console.log("fail4");
									});
							}, function(response3) {
								console.log("fail3");
							});
					}, function(response2) {
						console.log("fail2");
					});
			});
		}, function(response) {
			console.log("fail");
		});
}

function Goal($http) {
	var dailyGoal = 600;
	var weeklyGoal = 8000;

	$http.get("/goals")
		.then(function(data, status, headers, config) {
			dailyGoal = parseInt(data.data[0].dailyGoal);
			weeklyGoal = parseInt(data.data[0].weeklyGoal);
			//weeklyProgress = parseInt(data.data[0].weeklyProgress);
			//dailyProgress = parseInt(data.data[0].dailyProgress);
			//weeklyProjected = parseInt(data.data[0].weeklyProjected);
			//dailyProjected = parseInt(data.data[0].dailyProjected);
		}, function(data, status, headers, config) {
			console.log('fail hur');
		});

	this.__defineGetter__("dailyGoal", function() {
		return dailyGoal;
	});

	this.__defineSetter__("dailyGoal", function(val) {
		val = parseInt(val);
		dailyGoal = val;
	});

	this.__defineGetter__("weeklyGoal", function() {
		return weeklyGoal;
	});

	this.__defineSetter__("weeklyGoal", function(val) {
		val = parseInt(val);
		weeklyGoal = val;
	});
};

function Staff($http) {
	//var staff = '';
	staff = [];

	$http.get("/staff")
		.then(function(data, status, headers, config) {
			staff = data.data;
			//lastName = data.data[0].lastName;

		}, function(data, status, headers, config) {
			console.log('fail hur');
		});
	this.__defineGetter__("staff", function() {
		//return {firstName,lastName};
		return staff;
	});

	this.__defineSetter__("staff", function(val) {

	});
};

function Sales($http) {
	//var staff = '';
	sales = [];

	$http.get("/sales")
		.then(function(data, status, headers, config) {
			sales = data.data[0];
			//lastName = data.data[0].lastName;

		}, function(data, status, headers, config) {
			console.log('fail sales');
		});
	this.__defineGetter__("sales", function() {
		//return {firstName,lastName};
		return sales;
	});

	this.__defineSetter__("sales", function(val) {

	});
};

function Tactics($http) {
	//var staff = '';
	tactics = [];

	$http.get("/tactics")
		.then(function(data, status, headers, config) {
			tactics = data.data;
			//lastName = data.data[0].lastName;

		}, function(data, status, headers, config) {
			console.log('fail tactics');
		});
	this.__defineGetter__("tactics", function() {
		//return {firstName,lastName};
		return tactics;
	});

	this.__defineSetter__("tactics", function(val) {

	});
};


app.config(function($routeProvider) {
	$routeProvider
		.when("/", {
			templateUrl: "partials/MVP/sales.html"
		})
		.when("/home", {
			templateUrl: "partials/MVP/homeMVP.html"
		})
		.when("/history", {
			templateUrl: "partials/history.html"
		})
		.when("/insights", {
			templateUrl: "partials/insights.html"
		})
		.when("/staff", {
			templateUrl: "partials/MVP/staff.html"
		})
		.when("/yesterdayTab", {
			templateUrl: "partials/yesterdayTab.html"
		})
		.when("/setGoal", {
			templateUrl: "partials/setGoal.html"
		})
		.when("/adjustStaffGoals", {
			templateUrl: "partials/adjustStaffGoals.html"
		})
		.when("/weeklyGoals", {
			templateUrl: "partials/setWeeklyGoals.html"
		})
		.when("/weeklyGoalsTab", {
			templateUrl: "partials/weeklyGoalsTab.html"
		})
		.when("/daily", {
			templateUrl: "partials/setDailyGoals.html"
		})
		.when("/tips", {
			templateUrl: "partials/tips.html"
		})
		.when("/individualStaff", {
			templateUrl: "partials/MVP/staff/individualStaff.html"
		})
		.when("/lastWeek", {
			templateUrl: "partials/MVP/lastWeek.html"
		})
		.when("/staffYesterday", {
			templateUrl: "partials/staffYesterday.html"
		})
		.when("/staffLastWeek", {
			templateUrl: "partials/staffLastWeek.html"
		})
		.when("/staffThisWeek", {
			templateUrl: "partials/staffThisWeek.html"
		})
		.when("/locations", {
			templateUrl: "partials/locations.html"
		});

});
app.filter('orderObjectBy', function() {
	return function(items, field, reverse) {
		var filtered = [];
		angular.forEach(items, function(item) {
			filtered.push(item);
		});



		filtered.sort(function(a, b) {
			if (field == "avgTicket" || field == "percentToAvg") {
				return (a["sales"] / a["orders"] > b["sales"] / b["orders"] ? 1 : -1);
			}
			else {
				//console.log(field);
				return (a[field] > b[field] ? 1 : -1);
			}
		});
		if (reverse) filtered.reverse();
		return filtered;
	};
});


app.run(function($rootScope, $location, $localStorage) {

	var history = [];

	$localStorage.history = history;

	$rootScope.$on('$routeChangeSuccess', function() {
		//history.push($location.$$path);
		$localStorage.history.push($location.$$path);

	});

	$rootScope.back = function(sec) {
		var prevUrl = $localStorage.history.length > 1 ? $localStorage.history.splice(-2)[0] : "/";
		//var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
		$location.path(prevUrl);
		return section=sec;
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

angular.module('filters.mathAbs', [])
	.filter('makePositive', function() {
		return function(num) {
			return Math.abs(num);
		}
	});

$(app).ready(function() {
	$("pp").click(function() {
		$(this).hide();
	});
});

// checks if one day has passed. return "true" is so
function hasOneDayPassed() {
	var date = new Date().toLocaleDateString();

	if (localStorage.yourapp_date == date)
		return false;

	localStorage.yourapp_date = date;
	return true;
};

function closeHamburger()  {
	var menuInput = $('#menuToggle > input');
	menuInput.prop('checked', false);
}

var INCENTIVE = "TOUR CERVECERO4";





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