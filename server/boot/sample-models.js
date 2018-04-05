module.exports = async function (app) {
  var User = app.models.User;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;
  const FileContainer = app.models.FileContainer;
  const configPath = process.env.NODE_ENV === undefined ? '../../server/config.json' : `../../server/config.${process.env.NODE_ENV}.json`;
  const config = require(configPath);
  const imageBaseUrl = config.domain + '/api';
  const images = [
    imageBaseUrl + '/files/images/download/e99bcfb0-ddd3-11e7-8654-77a982fe81a21512928788523.jpg',
    imageBaseUrl + '/files/images/download/e99bcfb0-ddd3-11e7-8654-77a982fe81a21512928788523.jpg',
    imageBaseUrl + '/files/images/download/e99bcfb0-ddd3-11e7-8654-77a982fe81a21512928788523.jpg',
    imageBaseUrl + '/files/images/download/e99bcfb0-ddd3-11e7-8654-77a982fe81a21512928788523.jpg'
  ];

  const fields = [
    {
      key: 'key1',
      type: 'text'
    },
    {
      key: 'key2',
      type: 'text'
    },
    {
      key: 'key3',
      type: 'number'
    },
    {
      key: 'key4',
      type: 'choose',
      values: [
        { value: 'value1', fields: [] },
        { value: 'value2', fields: [] }
      ]
    }
  ];

  const carFields = [
    {
      key: 'نوع السيارة',
      type: 'choose',
      values: [
        {
          value: 'Kia', "fields": [
            {
              key: 'Kia نوع السيارة',
              type: 'choose',
              values: [
                { value: 'Rio 1', fields: [] },
                { value: 'Rio 2', fields: [] },
                { value: 'Rio 3', fields: [] }
              ]
            }
          ]
        },
        {
          value: 'Ford', "fields": [
            {
              key: 'Ford نوع السيارة',
              type: 'choose',
              values: [
                { value: 'mustang 1', fields: [] },
                { value: 'mustang 2', fields: [] },
                { value: 'mustang 3', fields: [] }
              ]
            }
          ]
        },
        {
          value: 'Mercedes', "fields": [
            {
              key: 'Mercedes نوع السيارة',
              type: 'choose',
              values: [
                { value: 'amg 1', fields: [] },
                { value: 'amg 2', fields: [] },
                { value: 'amg 3', fields: [] }
              ]
            }
          ]
        }
      ]
    }
  ];

  const fieldsValue = [
    {
      key: 'key1',
      value: 'value11'
    },
    {
      key: 'key2',
      type: 'value22'
    },
    {
      key: 'key3',
      type: 55
    },
    {
      key: 'key4',
      value: 'value1'
    }
  ];

  try {
    const user = await User.find();

    if (user.length <= 0) {
      // for fileSystem conntainer
      // const imageContainer = await  FileContainer.getContainer('images');
      // if (!imageContainer) {
      //   FileContainer.createContainer({
      //     name: "images"
      //   }, function (err, container) {
      //     if (err)
      //       throw err;
      //     console.log("created container Files: ", container.name);
      //   });
      // }


      let users = await User.create([
        {
          email: 'admin@dlaaal.com',
          password: 'password',
          emailVerified: true,
          status: "active",
          firstName: "ff",
          lastName: "ll",
          phone: "+96334582135",
        },
        {
          email: 'customer1@dlaaal.com',
          password: 'password',
          emailVerified: true,
          status: "active",
          firstName: "ff",
          lastName: "ll",
          phone: "+96334582135",
        },
        {
          email: 'customer2@dlaaal.com',
          password: 'password',
          emailVerified: true,
          status: "active",
          firstName: "ff",
          lastName: "ll",
          phone: "+96334582135",
        }
      ]);
      // console.log('Created users:', users);

      let cities = await app.models.City.create([
        { name: 'دمشق' },
        { name: 'ريف دمشق' },
        { name: 'حمص' },
      ]);
      // console.log('Created cities:', cities);

      let reports = await app.models.Report.create([
        { name: 'أساء تصنيف' },
        { name: 'تكرار' },
        { name: 'منتهي الصلاحية' },
      ]);
      // console.log('Created reports:', reports);

      let customer = users.find(o => o.email === 'customer1@dlaaal.com');
      let customer2 = users.find(o => o.email === 'customer2@dlaaal.com');
      let appAdmin = users.find(o => o.email === 'admin@dlaaal.com');

      //Create Roles and assign to user
      Role.create({
        name: 'admin'
      }).then(role => {
        console.log('Created role:', role);
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: appAdmin.id
        }).then(principal => {
          console.log('Created principal:', principal);
        });
      });

      const categories = await app.models.Category.create([
        {
          title: 'عقارات',
          image: images[0]
        },
        {
          title: 'مركبات',
          image: images[0],
          fields: carFields
        },
        {
          title: 'متفرقات',
          image: images[0]
        },
        {
          title: 'أشياء مجانية',
          image: images[0]
        },
      ]);
      // console.log('Created categories: ', categories);

      let subCategories = await app.models.SubCategory.create([
        {
          title: 'عقارات 1',
          categoryId: categories.find(o => o.title === 'عقارات').id,
          fields: fields
        },
        {
          title: 'عقارات 2',
          categoryId: categories.find(o => o.title === 'عقارات').id,
          fields: fields
        },
        {
          title: 'مركبات 1',
          categoryId: categories.find(o => o.title === 'مركبات').id,
          fields: fields
        },
        {
          title: 'عقارات 1',
          categoryId: categories.find(o => o.title === 'عقارات').id,
          fields: fields
        },
        {
          title: 'متفرقات 1',
          categoryId: categories.find(o => o.title === 'متفرقات').id,
          fields: fields
        },
        {
          title: 'أشياء مجانية 1',
          categoryId: categories.find(o => o.title === 'أشياء مجانية').id,
          fields: fields
        }
      ]);
      // console.log('Created subCategories: ', subCategories);

      //custome2 follow customer 1
      // await  app.models.Follow.create({
      //   ownerId: customer2.id,
      //   userId: customer.id
      // });
      // await  app.models.Follow.create({
      //   ownerId: appAdmin.id,
      //   userId: customer.id
      // });
      // await  app.models.Follow.create({
      //   ownerId: customer2.id,
      //   userId: appAdmin.id
      // });

      // const ads = await app.models.Advertisement.create([
      //   {
      //     title: "شيفروليه امبالا كاملة المواصفات",
      //     description: "خالية العلام",
      //     fields: [
      //       {
      //         "key": "string",
      //         "value": "string",
      //       }
      //     ],
      //     images: images,
      //     price: 120000000.,
      //     address: "مشروع دمر",
      //     phone: "+96334582135",
      //     cityId: cities.find(o => o.name === 'دمشق').id,
      //     categoryId: categories.find(o => o.title === 'مركبات').id,
      //     subCategoryId: subCategories.find(o => o.title === 'مركبات 1').id,
      //     ownerId: customer.id
      //   },
      //   {
      //     title: "شيفروليه ",
      //     description: "خالية العلام",
      //     fields: [
      //       {
      //         "key": "string",
      //         "value": "string",
      //       }
      //     ],
      //     images: images,
      //     price: 120000000.,
      //     address: "مشروع دمر",
      //     status: 'closed',
      //     phone: "+96334582135",
      //     cityId: cities.find(o => o.name === 'دمشق').id,
      //     categoryId: categories.find(o => o.title === 'مركبات').id,
      //     subCategoryId: subCategories.find(o => o.title === 'مركبات 1').id,
      //     ownerId: customer.id
      //   }
      // ]);
      // console.log('Created Ads: ', ads);
      //
      // await app.models.Notification.create([
      //   {
      //     advertisementId: ads[0].id,
      //     ownerId: appAdmin.id,
      //     type: 'NEW_ADS'
      //   },
      //   {
      //     advertisementId: ads[1].id,
      //     ownerId: appAdmin.id,
      //     type: 'NEW_ADS'
      //   },
      //   {
      //     advertisementId: ads[0].id,
      //     ownerId: customer2.id,
      //     type: 'NEW_ADS'
      //   },
      //   {
      //     advertisementId: ads[1].id,
      //     ownerId: customer2.id,
      //     type: 'NEW_ADS'
      //   }]);
      // await  app.models.advertisementReport.create({
      //   advertisementId: ads[0].id,
      //   userId: appAdmin.id,
      //   reportId: reports[0].id
      // });
      //
      // await  app.models.Bookmark.create({
      //   advertisementId: ads[0].id,
      //   ownerId: appAdmin.id
      // });
      // await  app.models.Bookmark.create({
      //   advertisementId: ads[1].id,
      //   ownerId: appAdmin.id
      // });
      //
      // await  app.models.Bookmark.create({
      //   advertisementId: ads[0].id,
      //   ownerId: customer2.id
      // });
      console.log('seedData: DONE!');
    }

  } catch (err) {
    console.log(err)
    throw err;
  }
};
