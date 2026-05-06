
module.exports = (schema, source = "body") =>
    (req, res, next) => {
        try {
            schema.parse(req[source]);
            next();
        } catch (err) {
            return res.status(400).json({
                error: "Validation failed",
                details: err.errors
            });
        }
    };