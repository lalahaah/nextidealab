/**
 * @interface IRepository
 */
export class IRepository {
    getAll() { throw new Error("Method not implemented"); }
    getById(id) { throw new Error("Method not implemented"); }
    add(item) { throw new Error("Method not implemented"); }
    update(id, item) { throw new Error("Method not implemented"); }
    delete(id) { throw new Error("Method not implemented"); }
    subscribe(callback) { throw new Error("Method not implemented"); }
}

export class IInquiryRepository extends IRepository {
    // Add specialized methods if needed
}

export class IProjectRepository extends IRepository { }
export class IInsightRepository extends IRepository { }
