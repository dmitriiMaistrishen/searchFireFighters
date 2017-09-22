'use strict'

angular.module('fireFighterHandler').component('fireFighterCounter',{
	templateUrl: 'fireFighterHandler/fireFighterCounter.html',
	controller: function FireFighterCounterController(){
		var self = this;
		this.counter = 0; 
		this.professions = [];
		this.countryList = [];
		
		this.adAccountID = "";
		this.cleanID = function(){
			self.adAccountID = "";
		}
		
		this.accessToken = "";
		this.cleanToken = function(){
			self.accessToken = "";
		}
		
		this.gender = '1';
		
		this.handleError = function(data){
			for(var p in data){
				if(p == 'error'){
					console.log(data);
					throw new Error(alert('There was en error: ' + data['error']['message'] + ' See details in the console'));
				}
			}
		}
		
		this.getJobsCodes = function(access_token){
			var professions = [];
			FB.api('/search','GET',{ 'access_token': access_token, 'q':'Fire Fighter', 'type': 'adworkposition'}, function(response){
				self.handleError(response);
				for(var i = 0; i < response['data'].length; i++){
					professions.push(response['data'][i]['id']);
				}
				self.professions = professions;
			})
		}
		
		this.getCountryList = function(access_token){
			var countries = [];
			var autocompleterContainer = [];
			FB.api('/search?pretty=0&type=adgeolocation&location_types=["country"]&limit=1000','GET',{'access_token': access_token}, function(response){
				self.handleError(response);
				for(var i = 0; i < response['data'].length; i++){
					//countries.push(response['data'][i]['name']);
					var bufer = {'name':'', 'country_code':''};
					bufer['name'] = response['data'][i]['name'];
					bufer['country_code'] = response['data'][i]['country_code'];
					countries.push(bufer);
					
					//autocompleterContainer.push(response['data'][i]['name']);
				}
				self.countryList = countries;
				
				//$( "#country" ).autocomplete({
				//	source: autocompleterContainer,
					//minLength: 2
				//});
			})
		}
		
		this.startSearch = function(){
			self.getJobsCodes(self.accessToken);
			self.getCountryList(self.accessToken);
			
			(function checkLists(){
				if((self.professions)&&(self.countryList)){
					$('#interface').slideUp(1);
					$('#interface').css('visibility', 'visible');
					$('#interface').slideDown('fast');
					return;
				}
				else{
					setTimeout(checkLists, 500);
				}
			})();
		}
		
		this.countryHandler = function(){
			for(var i = 0; i < self.countryList.length; i++){
				if(self.countryName == self.countryList[i]['name']){
					self.countryCode = self.countryList[i]['country_code'];
					self.runCounter();
					return;
				}
			}
		}
		
		this.countFireFighters = function(ad_account_id, access_token, country, min_age, max_age, gender, professions){
			var targeting_spec = {
				'geo_locations': {
					'countries': Array(country),
				},
				'age_min': min_age,
				'age_max': max_age,
				'genders': gender,
				'work_positions': professions,
			}
			
			FB.api(String(ad_account_id) + '/reachestimate', 'GET', {'targeting_spec': targeting_spec, 'access_token': access_token}, function(response){
				self.handleError(response);
				//self.counter = response['data']['users'];	does not work properly. why!?
				$($('#FFCounter')[0]).text("Firefighters found: " + response['data']['users']);
			})
		}
		
		this.runCounter = function(){
			var gen = [];
			if(self.gender == "0"){gen = [1,2];}
			else{gen = Array(self.gender);}
			if(self.minAge < 13){
				alert('Users must be older then 13 to use Facebook!');
				return;
			}
			if(!!self.professions){self.professions = ["112262562119522","1450086541948364","109344832416688"];}
			self.countFireFighters(self.adAccountID, self.accessToken, self.countryCode, self.minAge, self.maxAge, gen, self.professions);
		}
	},
})