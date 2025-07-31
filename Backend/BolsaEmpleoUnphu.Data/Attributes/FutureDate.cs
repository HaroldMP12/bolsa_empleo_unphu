using System.ComponentModel.DataAnnotations;

namespace BolsaEmpleoUnphu.Data.Attributes;

public class FutureDateAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value is DateTime dateTime)
        {
            return dateTime > DateTime.Now;
        }
        return false;
    }

    public override string FormatErrorMessage(string name)
    {
        return $"La {name} debe ser una fecha futura";
    }
}