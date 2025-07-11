namespace backend.DTOs;

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public required string Message { get; set; }
    public required object Details { get; set; }
}
