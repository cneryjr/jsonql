# jsonql
jsonql - query APIs to JSON collections


## Examples
Consider two collections

```javascript

  let JsonQL = require('./jsonql')

  let persons = [{
    "id": "5",
    "name": "Pedro",
    "occupation": "student",
    "age": 8,
    "favorites": {"movies": false, "nba": false}
  }, {
    "id": "1",
    "name": "David",
    "occupation": "student",
    "age": 5,
    "favorites": {"movies": true, "nba": false}
  }, {
    "id": "3",
    "name": "Cassia",
    "occupation": "manager",
    "age": 39,
    "favorites": {"movies": false, "nba": false}
  }, {
    "id": "4",
    "name": "Nery",
    "occupation": "director",
    "age": 43,
    "favorites": {"movies": true, "nba": true}
  }, {
    "id": "2",
    "name": "Daniel",
    "occupation": "director",
    "age": 30,
    "favorites": {"movies": true, "nba": true}
  }];

  let companies = [{
    id: 1,
    personId: "5",
    city: "Uberlandia",
    name: "Gabarito"
  },{
    id: 2,
    personId: "1",
    city: "Uberlandia",
    name: "Gabarito"
  },{
    id: 3,
    personId: "3",
    city: "Uberlandia",
    name: "Martins"
  }, {
    id: 4,
    personId: "2",
    city: "Sao Paulo",
    name: "Yandeh"
  }]
```

Query:

```javascript
  let rs = 	new JsonQL(persons)
    .join(companies,[['id','personId']])
    // .equals("city", "Uberlandia")
    // .greater("age", 3)
    // .orderby("name")
    .select(['name', 'name$1', 'age'])

 console.log(rs)
```

Result:
```javascript
  [ 
    { name: 'Pedro', 'name$1': 'Gabarito', age: 8 },
    { name: 'David', 'name$1': 'Gabarito', age: 5 },
    { name: 'Cassia', 'name$1': 'Martins', age: 39 },
    { name: 'Daniel', 'name$1': 'Yandeh', age: 30 } 
  ]
```  
