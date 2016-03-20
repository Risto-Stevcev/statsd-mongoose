const expect    = require('chai').expect
    , mongoose  = require('mongoose')
    , mockgoose = require('mockgoose')
    , dgram     = require('dgram')
const statsdMongoose = require('../src/statsd-mongoose')

describe('Statsd Mongoose', function() {
  before(function() {
    this.server = dgram.createSocket('udp4')
    this.server.bind({ address: 'localhost', port: 8125 })
    const msgs = []
    this.server.on('message', msg => msgs.push(msg.toString()))
    this.lastMsg = () => msgs[msgs.length - 1]
  })

  before(function(done) {
    mockgoose(mongoose)
    mongoose.connect('mongodb://user:pass.localhost:47484/test-db', err => done(err))
    mongoose.plugin(statsdMongoose)

    const blogSchema = new mongoose.Schema({ title: String, author: String, body: String })
    this.Blog = mongoose.model('Blog', blogSchema)

    this.entry = {
      title: 'My first blog',
      author: 'foobar',
      body: 'This is the body of my first blog'
    }

    this.entry2 = {
      title: 'My second blog',
      author: 'foobar',
      body: 'This is the body of my second blog'
    }

    this.entry3 = {
      title: 'My third blog',
      author: 'foobar',
      body: 'This is the body of my third blog'
    }
  })

  describe('save', function() {
    it('should create the first blog entry', function(done) {
      new this.Blog(this.entry).save(err => {
        expect(err).to.be.null
        done()
      })
    })
    it('should have sent a `save` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.save:(\d+\.\d+)\|ms/)
    })

    it('should create the second blog entry', function(done) {
      new this.Blog(this.entry2).save(err => {
        expect(err).to.be.null
        done()
      })
    })
    it('should have sent a `save` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.save:(\d+\.\d+)\|ms/)
    })

    it('should create the second blog entry', function(done) {
      new this.Blog(this.entry3).save(err => {
        expect(err).to.be.null
        done()
      })
    })
    it('should have sent a `save` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.save:(\d+\.\d+)\|ms/)
    })
  })

  describe('find', function() {
    it('should return the blog entry', function(done) {
      this.Blog.find().select('-_id -__v').lean().exec((err, model) => {
        expect(err).to.be.null
        expect(model.length).to.equal(3)
        expect(model).to.deep.equal([this.entry, this.entry2, this.entry3])
        done()
      })
    })

    it('should have sent a `find` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.find:(\d+\.\d+)\|ms/)
    })
  })

  describe('findOne', function() {
    it('should return the blog entry', function(done) {
      this.Blog.findOne({ title: 'My first blog' }).select('-__v').lean().exec((err, model) => {
        expect(err).to.be.null
        this.entry._id = model._id
        expect(model).to.deep.equal(this.entry)
        done()
      })
    })

    it('should have sent a `findOne` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.findOne:(\d+\.\d+)\|ms/)
    })
  })

  describe('findOneAndUpdate', function() {
    it('should update the blog entry', function(done) {
      this.Blog.findOneAndUpdate({ title: 'My first blog' }, { title: 'My updated blog' }).exec((err, model) => {
        expect(err).to.be.null
        done()
      })
    })

    it('should have sent a `findOneAndUpdate` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.findOneAndUpdate:(\d+\.\d+)\|ms/)
    })
  })

  describe('findByIdAndUpdate', function() {
    it('should update the blog entry', function(done) {
      this.Blog.findByIdAndUpdate(this.entry._id, { title: 'My modified blog' }).exec((err, model) => {
        expect(err).to.be.null
        done()
      })
    })

    it('should have sent a `findOneAndUpdate` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.findOneAndUpdate:(\d+\.\d+)\|ms/)
    })
  })

  describe('update', function() {
    it('should update the blog entry', function(done) {
      this.Blog.findOne({ title: 'My modified blog' }).exec((err, model) => {
        expect(err).to.be.null
        model.update({ title: 'My awesome blog' }, err => {
          expect(err).to.be.null
          done()
        })
      })
    })

    it('should have sent an `update` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.update:(\d+\.\d+)\|ms/)
    })
  })

  describe('findOneAndRemove', function() {
    it('should remove the blog entry', function(done) {
      this.Blog.findOneAndRemove({ title: 'My second blog' }).exec(err => {
        expect(err).to.be.null
        done()
      })
    })

    it('should have sent a `findOneAndRemove` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.findOneAndRemove:(\d+\.\d+)\|ms/)
    })

    it('should no longer have the blog entry', function(done) {
      this.Blog.findOne({ title: 'My second blog' }).exec((err, model) => {
        expect(err).to.be.null
        expect(model).to.be.null
        done()
      })
    })
  })

  describe('findByIdAndRemove', function() {
    it('should remove the blog entry', function(done) {
      this.Blog.findByIdAndRemove(this.entry._id).exec(err => {
        expect(err).to.be.null
        done()
      })
    })

    it('should have sent a `findOneAndRemove` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.findOneAndRemove:(\d+\.\d+)\|ms/)
    })

    it('should no longer have the blog entry', function(done) {
      this.Blog.findById(this.entry._id).exec((err, model) => {
        expect(err).to.be.null
        expect(model).to.be.null
        done()
      })
    })
  })

  describe('remove', function() {
    it('should remove the blog entry', function(done) {
      this.Blog.findOne({ title: 'My third blog' }).exec((err, model) => {
        expect(err).to.be.null
        expect(model.title).to.equal('My third blog')
        model.remove(err => {
          expect(err).to.be.null
          done()
        })
      })
    })

    it('should have sent a `remove` timer to statsd', function() {
      expect(this.lastMsg()).to.match(/db\.blog\.remove:(\d+\.\d+)\|ms/)
    })

    it('should no longer have the blog entry', function(done) {
      this.Blog.findOne({ title: 'My third blog' }).exec((err, model) => {
        expect(err).to.be.null
        expect(model).to.be.null
        done()
      })
    })

    it('should no longer have any blog entries', function(done) {
      this.Blog.find().exec((err, model) => {
        expect(err).to.be.null
        expect(model).to.be.empty
        done()
      })
    })
  })

  after(function() {
    mongoose.connection.close()
    this.server.close()
  })
})
