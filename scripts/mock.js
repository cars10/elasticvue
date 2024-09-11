exports.mock = async page => {
  const mocks = {
    ping: {
      url: 'http://localhost:9200/',
      json: {
        'name': 'feeds-prod-1',
        'cluster_name': 'feeds-production',
        'cluster_uuid': 'ecdKaffmR9WkFbKDW4PUWw',
        'version': {
          'number': '8.7.1',
          'build_flavor': 'default',
          'build_type': 'docker',
          'build_hash': 'f229ed3f893a515d590d0f39b05f68913e2d9b53',
          'build_date': '2023-04-27T04:33:42.127815583Z',
          'build_snapshot': false,
          'lucene_version': '9.5.0',
          'minimum_wire_compatibility_version': '7.17.0',
          'minimum_index_compatibility_version': '7.0.0'
        },
        'tagline': 'You Know, for Search'
      },
    },
    search: {
      url: 'http://localhost:9200/_search', json: {}
    },
    searchSearch: {
      url: 'http://localhost:9200/*/_search',
      json: {
        'took': 2, 'timed_out': false, '_shards': { 'total': 2, 'successful': 1, 'skipped': 0, 'failed': 0 },
        'hits': {
          'total': { 'value': 25, 'relation': 'eq' }, 'max_score': 1.0,
          'hits': [
            {
              '_index': 'movies',
              '_type': '_doc',
              '_id': 'iSJ6CYoBC9ASmdmkJcae',
              '_score': 1.0,
              '_source': {
                'Title': 'Iron Man',
                'Year': '2008',
                'Rated': 'PG-13',
                'Released': '02 May 2008',
                'Runtime': '126 min',
                'Genre': 'Action, Adventure, Sci-Fi',
                'Director': 'Jon Favreau',
                'Writer': 'Mark Fergus (screenplay), Hawk Ostby (screenplay), Art Marcum (screenplay), Matt Holloway (screenplay), Stan Lee (characters), Don Heck (characters), Larry Lieber (characters), Jack Kirby (characters)',
                'Actors': 'Robert Downey Jr., Terrence Howard, Jeff Bridges, Gwyneth Paltrow',
                'Plot': 'After being held captive in an Afghan cave, a billionaire engineer creates a unique weaponized suit of armor to fight evil.',
                'Language': 'English, Persian, Urdu, Arabic, Hungarian',
                'Country': 'USA',
                'Awards': 'Nominated for 2 Oscars. Another 19 wins & 61 nominations.',
                'Poster': 'http://ia.media-imdb.com/images/M/MV5BMTczNTI2ODUwOF5BMl5BanBnXkFtZTcwMTU0NTIzMw@@._V1_SX300.jpg',
                'Metascore': '79',
                'imdbRating': '7.9',
                'imdbVotes': '689,098',
                'imdbID': 'tt0371746',
                'Type': 'movie',
                'Response': 'True'
              }
            },
            {
              '_index': 'movies',
              '_type': '_doc',
              '_id': 'iiJ6CYoBC9ASmdmkJcag',
              '_score': 1.0,
              '_source': {
                'Title': 'Iron Man 2',
                'Year': '2010',
                'Rated': 'PG-13',
                'Released': '07 May 2010',
                'Runtime': '124 min',
                'Genre': 'Action, Adventure, Sci-Fi',
                'Director': 'Jon Favreau',
                'Writer': 'Justin Theroux (screenplay), Stan Lee (Marvel comic book), Don Heck (Marvel comic book), Larry Lieber (Marvel comic book), Jack Kirby (Marvel comic book)',
                'Actors': 'Robert Downey Jr., Gwyneth Paltrow, Don Cheadle, Scarlett Johansson',
                'Plot': 'With the world now aware of his identity as Iron Man, Tony Stark must contend with both his declining health and a vengeful mad man with ties to his fathers legacy.',
                'Language': 'English, French, Russian',
                'Country': 'USA',
                'Awards': 'Nominated for 1 Oscar. Another 7 wins & 40 nominations.',
                'Poster': 'http://ia.media-imdb.com/images/M/MV5BMTM0MDgwNjMyMl5BMl5BanBnXkFtZTcwNTg3NzAzMw@@._V1_SX300.jpg',
                'Metascore': '57',
                'imdbRating': '7.0',
                'imdbVotes': '515,464',
                'imdbID': 'tt1228705',
                'Type': 'movie',
                'Response': 'True'
              }
            },
            {
              '_index': 'movies',
              '_type': '_doc',
              '_id': 'iyJ6CYoBC9ASmdmkJcag',
              '_score': 1.0,
              '_source': {
                'Title': 'Frozen',
                'Year': '2013',
                'Rated': 'PG',
                'Released': '27 Nov 2013',
                'Runtime': '102 min',
                'Genre': 'Animation, Adventure, Comedy',
                'Director': 'Chris Buck, Jennifer Lee',
                'Writer': 'Jennifer Lee (screenplay), Hans Christian Andersen (story inspired by \'The Snow Queen\' by), Chris Buck (story by), Jennifer Lee (story by), Shane Morris (story by)',
                'Actors': 'Kristen Bell, Idina Menzel, Jonathan Groff, Josh Gad',
                'Plot': 'When the newly crowned Queen Elsa accidentally uses her power to turn things into ice to curse her home in infinite winter, her sister, Anna, teams up with a mountain man, his playful reindeer, and a snowman to change the weather condition.',
                'Language': 'English, Icelandic',
                'Country': 'USA',
                'Awards': 'Won 2 Oscars. Another 72 wins & 57 nominations.',
                'Poster': 'http://ia.media-imdb.com/images/M/MV5BMTQ1MjQwMTE5OF5BMl5BanBnXkFtZTgwNjk3MTcyMDE@._V1_SX300.jpg',
                'Metascore': '74',
                'imdbRating': '7.6',
                'imdbVotes': '415,027',
                'imdbID': 'tt2294629',
                'Type': 'movie',
                'Response': 'True'
              }
            },
            {
              '_index': 'movies',
              '_type': '_doc',
              '_id': 'jCJ6CYoBC9ASmdmkJcag',
              '_score': 1.0,
              '_source': {
                'Title': 'Ghostbusters',
                'Year': '1984',
                'Rated': 'PG',
                'Released': '08 Jun 1984',
                'Runtime': '105 min',
                'Genre': 'Adventure, Comedy, Fantasy',
                'Director': 'Ivan Reitman',
                'Writer': 'Dan Aykroyd, Harold Ramis',
                'Actors': 'Bill Murray, Dan Aykroyd, Sigourney Weaver, Harold Ramis',
                'Plot': 'Three former parapsychology professors set up shop as a unique ghost removal service.',
                'Language': 'English',
                'Country': 'USA',
                'Awards': 'Nominated for 2 Oscars. Another 6 wins & 6 nominations.',
                'Poster': 'http://ia.media-imdb.com/images/M/MV5BMTkxMjYyNzgwMl5BMl5BanBnXkFtZTgwMTE3MjYyMTE@._V1_SX300.jpg',
                'Metascore': '67',
                'imdbRating': '7.8',
                'imdbVotes': '261,569',
                'imdbID': 'tt0087332',
                'Type': 'movie',
                'Response': 'True'
              }
            },
            {
              '_index': 'movies',
              '_type': '_doc',
              '_id': 'jSJ6CYoBC9ASmdmkJcag',
              '_score': 1.0,
              '_source': {
                'Title': 'The Bourne Identity',
                'Year': '2002',
                'Rated': 'PG-13',
                'Released': '14 Jun 2002',
                'Runtime': '119 min',
                'Genre': 'Action, Mystery, Thriller',
                'Director': 'Doug Liman',
                'Writer': 'Tony Gilroy (screenplay), W. Blake Herron (screenplay), Robert Ludlum (novel)',
                'Actors': 'Matt Damon, Franka Potente, Chris Cooper, Clive Owen',
                'Plot': 'A man is picked up by a fishing boat, bullet-riddled and suffering from amnesia, before racing to elude assassins and regain his memory.',
                'Language': 'English, French, German, Dutch, Italian',
                'Country': 'USA, Germany, Czech Republic',
                'Awards': '3 wins & 5 nominations.',
                'Poster': 'http://ia.media-imdb.com/images/M/MV5BMTQ3MDA4MDIyN15BMl5BanBnXkFtZTYwOTg0Njk4._V1_SX300.jpg',
                'Metascore': '68',
                'imdbRating': '7.9',
                'imdbVotes': '399,968',
                'imdbID': 'tt0258463',
                'Type': 'movie',
                'Response': 'True'
              }
            },
            {
              '_index': 'movies',
              '_type': '_doc',
              '_id': 'jiJ6CYoBC9ASmdmkJcag',
              '_score': 1.0,
              '_source': {
                'Title': 'Game of Thrones',
                'Year': '2011–',
                'Rated': 'TV-MA',
                'Released': '17 Apr 2011',
                'Runtime': '56 min',
                'Genre': 'Adventure, Drama, Fantasy',
                'Director': 'N/A',
                'Writer': 'David Benioff, D.B. Weiss',
                'Actors': 'Peter Dinklage, Lena Headey, Emilia Clarke, Kit Harington',
                'Plot': 'While a civil war brews between several noble families in Westeros, the children of the former rulers of the land attempt to rise up to power. Meanwhile a forgotten race, bent on destruction, plans to return after thousands of years in the North.',
                'Language': 'English',
                'Country': 'USA, UK',
                'Awards': 'Won 1 Golden Globe. Another 183 wins & 307 nominations.',
                'Poster': 'http://ia.media-imdb.com/images/M/MV5BMjM5OTQ1MTY5Nl5BMl5BanBnXkFtZTgwMjM3NzMxODE@._V1_SX300.jpg',
                'Metascore': 'N/A',
                'imdbRating': '9.5',
                'imdbVotes': '1,010,798',
                'imdbID': 'tt0944947',
                'Type': 'series',
                'Response': 'True',
                'totalSeasons': '7'
              }
            },
            {
              '_index': 'movies',
              '_type': '_doc',
              '_id': 'jyJ6CYoBC9ASmdmkJcag',
              '_score': 1.0,
              '_source': {
                'Title': 'The Hunger Games',
                'Year': '2012',
                'Rated': 'PG-13',
                'Released': '23 Mar 2012',
                'Runtime': '142 min',
                'Genre': 'Adventure, Drama, Sci-Fi',
                'Director': 'Gary Ross',
                'Writer': 'Gary Ross (screenplay), Suzanne Collins (screenplay), Billy Ray (screenplay), Suzanne Collins (novel)',
                'Actors': 'Stanley Tucci, Wes Bentley, Jennifer Lawrence, Willow Shields',
                'Plot': 'Katniss Everdeen voluntarily takes her younger sisters place in the Hunger Games, a televised competition in which two teenagers from each of the twelve Districts of Panem are chosen at random to fight to the death.',
                'Language': 'English',
                'Country': 'USA',
                'Awards': 'Nominated for 1 Golden Globe. Another 34 wins & 42 nominations.',
                'Poster': 'http://ia.media-imdb.com/images/M/MV5BMjA4NDg3NzYxMF5BMl5BanBnXkFtZTcwNTgyNzkyNw@@._V1_SX300.jpg',
                'Metascore': '68',
                'imdbRating': '7.3',
                'imdbVotes': '695,328',
                'imdbID': 'tt1392170',
                'Type': 'movie',
                'Response': 'True'
              }
            },
            {
              '_index': 'movies',
              '_type': '_doc',
              '_id': 'kCJ6CYoBC9ASmdmkJcag',
              '_score': 1.0,
              '_source': {
                'Title': 'Guardians of the Galaxy',
                'Year': '2014',
                'Rated': 'PG-13',
                'Released': '01 Aug 2014',
                'Runtime': '121 min',
                'Genre': 'Action, Adventure, Sci-Fi',
                'Director': 'James Gunn',
                'Writer': 'James Gunn, Nicole Perlman, Dan Abnett (comic book), Andy Lanning (comic book)',
                'Actors': 'Chris Pratt, Zoe Saldana, Dave Bautista, Vin Diesel',
                'Plot': 'A group of intergalactic criminals are forced to work together to stop a fanatical warrior from taking control of the universe.',
                'Language': 'English',
                'Country': 'USA, UK',
                'Awards': 'Nominated for 2 Oscars. Another 48 wins & 92 nominations.',
                'Poster': 'http://ia.media-imdb.com/images/M/MV5BMTAwMjU5OTgxNjZeQTJeQWpwZ15BbWU4MDUxNDYxODEx._V1_SX300.jpg',
                'Metascore': '76',
                'imdbRating': '8.1',
                'imdbVotes': '669,684',
                'imdbID': 'tt2015381',
                'Type': 'movie',
                'Response': 'True'
              }
            },
            {
              '_index': 'movies',
              '_type': '_doc',
              '_id': 'kSJ6CYoBC9ASmdmkJcag',
              '_score': 1.0,
              '_source': {
                'Title': 'The Hunger Games: Catching Fire',
                'Year': '2013',
                'Rated': 'PG-13',
                'Released': '22 Nov 2013',
                'Runtime': '146 min',
                'Genre': 'Adventure, Sci-Fi, Thriller',
                'Director': 'Francis Lawrence',
                'Writer': 'Simon Beaufoy (screenplay), Michael Arndt (screenplay), Suzanne Collins (novel)',
                'Actors': 'Jennifer Lawrence, Liam Hemsworth, Jack Quaid, Taylor St. Clair',
                'Plot': 'Katniss Everdeen and Peeta Mellark become targets of the Capitol after their victory in the 74th Hunger Games sparks a rebellion in the Districts of Panem.',
                'Language': 'English',
                'Country': 'USA',
                'Awards': 'Nominated for 1 Golden Globe. Another 21 wins & 59 nominations.',
                'Poster': 'http://ia.media-imdb.com/images/M/MV5BMTAyMjQ3OTAxMzNeQTJeQWpwZ15BbWU4MDU0NzA1MzAx._V1_SX300.jpg',
                'Metascore': '76',
                'imdbRating': '7.6',
                'imdbVotes': '493,490',
                'imdbID': 'tt1951264',
                'Type': 'movie',
                'Response': 'True'
              }
            },
            {
              '_index': 'movies',
              '_type': '_doc',
              '_id': 'kiJ6CYoBC9ASmdmkJcag',
              '_score': 1.0,
              '_source': {
                'Title': 'The Imitation Game',
                'Year': '2014',
                'Rated': 'PG-13',
                'Released': '25 Dec 2014',
                'Runtime': '114 min',
                'Genre': 'Biography, Drama, Thriller',
                'Director': 'Morten Tyldum',
                'Writer': 'Graham Moore, Andrew Hodges (book)',
                'Actors': 'Benedict Cumberbatch, Keira Knightley, Matthew Goode, Rory Kinnear',
                'Plot': 'During World War II, mathematician Alan Turing tries to crack the enigma code with help from fellow mathematicians.',
                'Language': 'English, German',
                'Country': 'UK, USA',
                'Awards': 'Won 1 Oscar. Another 44 wins & 147 nominations.',
                'Poster': 'http://ia.media-imdb.com/images/M/MV5BNDkwNTEyMzkzNl5BMl5BanBnXkFtZTgwNTAwNzk3MjE@._V1_SX300.jpg',
                'Metascore': '73',
                'imdbRating': '8.1',
                'imdbVotes': '452,678',
                'imdbID': 'tt2084970',
                'Type': 'movie',
                'Response': 'True'
              }
            }
          ]
        }
      }
    },
    searchIndices: {
      url: 'http://localhost:9200/movies',
      json: {
        'movies': {
          'mappings': {
            'properties': {
              'name': {
                'type': 'text'
              }
            }
          }
        }
      }
    },
    clusterHealth: {
      url: 'http://localhost:9200/_cluster/health',
      json: {
        'cluster_name': 'feeds-production',
        'status': 'green',
        'timed_out': false,
        'number_of_nodes': 4,
        'number_of_data_nodes': 4,
        'active_primary_shards': 25,
        'active_shards': 50,
        'relocating_shards': 0,
        'initializing_shards': 0,
        'unassigned_shards': 0,
        'delayed_unassigned_shards': 0,
        'number_of_pending_tasks': 0,
        'number_of_in_flight_fetch': 0,
        'task_max_waiting_in_queue_millis': 0,
        'active_shards_percent_as_number': 100
      },
    },
    clusterStats: {
      url: 'http://localhost:9200/_cluster/stats',
      json: {
        'cluster_name': 'feeds-production',
        'cluster_uuid': 'ecdKaffmR9WkFbKDW4PUWw',
        'status': 'green',
        'indices': {
          'count': 25,
          'shards': {
            'total': 50,
            'primaries': 25,
          },
          'docs': { 'count': 174182, 'deleted': 1337 },
          'store': { 'size_in_bytes': 13486148700 }
        },
        'nodes': {
          'count': {
            'total': 4,
            'data': 4,
            'coordinating_only': 0,
            'master': 4,
            'ingest': 4
          },
        }
      }
    },
    shardIndices: {
      url: 'http://localhost:9200/_cat/indices/?h=index%2Chealth%2Cpri%2Crep%2Cstatus&s=health%3Adesc%2Cindex',
      json: []
    },
    shardShards: {
      url: 'http://localhost:9200/_cat/shards/?h=index%2Cshard%2Cprirep%2Cstate%2Cnode',
      json: []
    },
    indexIndices: {
      url: 'http://localhost:9200/_cat/indices/?h=index%2Chealth%2Cstatus%2Cuuid%2Cpri%2Crep%2Cdocs.count%2Cstore.size%2Csc&bytes=b',
      json: []
    },
    flush: {
      url: 'http://localhost:9200/_flush',
      json: { '_shards': { 'total': 50, 'successful': 50, 'failed': 0 } }
    },
    catNodes: {
      url: 'http://localhost:9200/_cat/nodes?h=ip%2Cid%2Cname%2Cversion%2Cheap.percent%2Cheap.current%2Cheap.max%2Cram.percent%2Cram.current%2Cram.max%2Cnode.role%2Cmaster%2Ccpu%2Cload_1m%2Cload_5m%2Cload_15m%2Cdisk.used_percent%2Cdisk.used%2Cdisk.total&full_id=true',
      json: [
        {
          'ip': '192.168.112.1',
          'id': 'tz7KYbj8RSeyum3J-v4VZQ',
          'name': 'feeds-prod-1',
          'heap.percent': '42',
          'heap.current': '215.2mb',
          'heap.max': '512mb',
          'ram.percent': '73',
          'ram.current': '22.9gb',
          'ram.max': '31.2gb',
          'node.role': 'cdfhilmrstw',
          'master': '*',
          'cpu': '8',
          'load_1m': '0.72',
          'load_5m': '0.78',
          'load_15m': '1.10',
          'disk.used_percent': '40.71',
          'disk.used': '358.9gb',
          'disk.total': '881.6gb'
        },
        {
          'ip': '192.168.112.2',
          'id': '0tgdUvIbSOCHzADG18paPQ',
          'name': 'feeds-prod-2',
          'heap.percent': '42',
          'heap.current': '215.2mb',
          'heap.max': '512mb',
          'ram.percent': '73',
          'ram.current': '22.9gb',
          'ram.max': '31.2gb',
          'node.role': 'cdfhilmrstw',
          'master': '*',
          'cpu': '8',
          'load_1m': '0.72',
          'load_5m': '0.78',
          'load_15m': '1.10',
          'disk.used_percent': '40.71',
          'disk.used': '358.9gb',
          'disk.total': '881.6gb'
        },
        {
          'ip': '192.168.112.3',
          'id': 'o8NZD5umQdiBmKWIXd_Ueg',
          'name': 'feeds-prod-3',
          'heap.percent': '42',
          'heap.current': '215.2mb',
          'heap.max': '512mb',
          'ram.percent': '73',
          'ram.current': '22.9gb',
          'ram.max': '31.2gb',
          'node.role': 'cdfhilmrstw',
          'master': '*',
          'cpu': '8',
          'load_1m': '0.72',
          'load_5m': '0.78',
          'load_15m': '1.10',
          'disk.used_percent': '40.71',
          'disk.used': '358.9gb',
          'disk.total': '881.6gb'
        },
        {
          'ip': '192.168.112.4',
          'id': 'VPQwd_2ORE284KaE3TQABQ',
          'name': 'feeds-prod-4',
          'heap.percent': '42',
          'heap.current': '215.2mb',
          'heap.max': '512mb',
          'ram.percent': '73',
          'ram.current': '22.9gb',
          'ram.max': '31.2gb',
          'node.role': 'cdfhilmrstw',
          'master': '*',
          'cpu': '8',
          'load_1m': '0.72',
          'load_5m': '0.78',
          'load_15m': '1.10',
          'disk.used_percent': '40.71',
          'disk.used': '358.9gb',
          'disk.total': '881.6gb'
        }
      ]
    },
    nodes: {
      url: 'http://localhost:9200/_nodes',
      json: {
        'nodes': {
          'tz7KYbj8RSeyum3J-v4VZQ': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'main'
                }
              }
            }
          },
          '0tgdUvIbSOCHzADG18paPQ': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'main'
                }
              }
            }
          },
          'o8NZD5umQdiBmKWIXd_Ueg': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'offside'
                }
              }
            }
          },
          'VPQwd_2ORE284KaE3TQABQ': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'backup'
                }
              }
            }
          }

        }
      }
    },
    document: {
      url: 'http://localhost:9200/movies/_doc/*',
      json: {
        '_source': {
          'Title': 'Iron Man',
          'Year': '2008',
          'Rated': 'PG-13',
          'Released': '02 May 2008',
          'Runtime': '126 min',
          'Genre': 'Action, Adventure, Sci-Fi',
          'Director': 'Jon Favreau',
          'Writer': 'Mark Fergus (screenplay), Hawk Ostby (screenplay), Art Marcum (screenplay), Matt Holloway (screenplay), Stan Lee (characters), Don Heck (characters), Larry Lieber (characters), Jack Kirby (characters)',
          'Actors': 'Robert Downey Jr., Terrence Howard, Jeff Bridges, Gwyneth Paltrow',
          'Plot': 'After being held captive in an Afghan cave, a billionaire engineer creates a unique weaponized suit of armor to fight evil.',
          'Language': 'English, Persian, Urdu, Arabic, Hungarian',
          'Country': 'USA',
          'Awards': 'Nominated for 2 Oscars. Another 19 wins & 61 nominations.',
          'Poster': 'http://ia.media-imdb.com/images/M/MV5BMTczNTI2ODUwOF5BMl5BanBnXkFtZTcwMTU0NTIzMw@@._V1_SX300.jpg',
          'Metascore': '79',
          'imdbRating': '7.9',
          'imdbVotes': '689,098',
          'imdbID': 'tt0371746',
          'Type': 'movie',
          'Response': 'True'
        }
      }
    },
    searchIndexIndices: {
      url: 'http://localhost:9200/_cat/indices/?index=*&h=index',
      json: [
        { 'index': 'foo' }
      ]
    }
  }

  const indices = ['mentions', 'movies', 'imdb', 'actors', 'genres', 'scenes', 'sales', 'products', 'categories', 'tweets']

  for (const idx of indices) {
    // shards
    const nodes = ['feeds-prod-1', 'feeds-prod-2', 'feeds-prod-3', 'feeds-prod-4']
    mocks.shardIndices.json.push({ 'index': idx, 'health': 'green', 'pri': '1', 'rep': '1', 'status': 'open' })

    const node1 = nodes.splice(Math.floor(Math.random() * nodes.length), 1)[0]
    mocks.shardShards.json.push({ 'index': idx, 'shard': '0', 'prirep': 'p', 'state': 'STARTED', 'node': node1 })
    const node2 = nodes.splice(Math.floor(Math.random() * nodes.length), 1)[0]
    mocks.shardShards.json.push({ 'index': idx, 'shard': '0', 'prirep': 'r', 'state': 'STARTED', 'node': node2 })

    // indices
    const docs = Math.random() * 50000
    mocks.indexIndices.json.push({
      'index': idx,
      'health': 'green',
      'status': 'open',
      'uuid': randomId(),
      'pri': '1',
      'rep': '1',
      'sc': '1',
      'docs.count': docs.toString(),
      'store.size': (docs * 1024 * 10).toString()
    })
  }

  for (let i = 0; i < 15; i++) {
    // shards
    mocks.shardIndices.json.push({ 'index': `tweets${i}`, 'health': 'green', 'pri': '1', 'rep': '1', 'status': 'open' })
    // indices
    mocks.indexIndices.json.push({
      'index': `tweets${i}`,
      'health': 'green',
      'status': 'open',
      'uuid': randomId(),
      'pri': '1',
      'rep': '1',
      'sc': '1',
      'docs.count': (Math.random() * 10000).toString(),
      'store.size': (Math.random() * 1000000).toString()
    })
  }

  for (const method in mocks) {
    const url = mocks[method].url
    const json = mocks[method].json

    await page.route(url, async route => (await route.fulfill({ json })))
  }
}

const randomId = () => {
  return (Math.random() + 1).toString(36).substring(2) + (Math.random() + 1).toString(36).substring(2)
}